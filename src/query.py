"""
query.py - Step 4 of the pipeline.

Answers a question in three steps:
    1. Retrieve: embed the question and find the 5 most similar chunks in ChromaDB.
    2. Build the prompt: put those chunks (with file name and page) in front of the question.
    3. Call the LLM: ask it to answer ONLY from those chunks and cite them.
"""

import os
import sys

import anthropic
from dotenv import load_dotenv

from store import embed_texts, get_collection

# Read ANTHROPIC_API_KEY (and optional settings) from the .env file.
load_dotenv()

# ---- Config ----
TOP_K = 5                                            # how many chunks to retrieve
MODEL = os.getenv("LLM_MODEL", "claude-opus-5")      # Claude model to use
EFFORT = "low"                                       # low = faster and cheaper; enough for short Q&A
MAX_TOKENS = 2000                                    # upper limit on answer length
# ----------------

# The exact sentence the model must use when the answer is not in the chunks.
# evaluate.py checks for this sentence, so it lives in one place.
I_DONT_KNOW = "I don't know based on these documents"

SYSTEM_PROMPT = f"""You answer questions using ONLY the sources provided by the user.

Rules:
- Use only facts found in the sources. Do not use outside knowledge.
- After each fact, cite where it came from in this exact format: [file name, page X]
- If the sources do not contain the answer, reply exactly: "{I_DONT_KNOW}."
- Keep the answer short and clear."""


def retrieve(question: str, top_k: int = TOP_K) -> list[dict]:
    """Find the chunks whose meaning is closest to the question."""
    collection = get_collection()
    if collection.count() == 0:
        return []

    # The question must be embedded with the SAME model as the chunks,
    # otherwise the vectors are not comparable.
    question_vector = embed_texts([question])[0]

    results = collection.query(
        query_embeddings=[question_vector],
        n_results=min(top_k, collection.count()),
        include=["documents", "metadatas", "distances"],
    )

    # Chroma returns one list per question. We sent one question, so we take [0].
    chunks = []
    for text, metadata, distance in zip(
        results["documents"][0], results["metadatas"][0], results["distances"][0]
    ):
        chunks.append(
            {
                "text": text,
                "source": metadata["source"],
                "page": metadata["page"],
                "chunk_id": metadata["chunk_id"],
                "distance": distance,  # lower = more similar
            }
        )
    return chunks


def build_prompt(question: str, chunks: list[dict]) -> str:
    """Put the retrieved chunks and the question into one message for the LLM."""
    # Each source is labeled with the same format we want in the citations,
    # so the model can copy the label exactly.
    sources = "\n\n".join(
        f"[{chunk['source']}, page {chunk['page']}]\n{chunk['text']}" for chunk in chunks
    )
    return f"Sources:\n\n{sources}\n\n---\n\nQuestion: {question}"


def call_llm(prompt: str) -> str:
    """Send the prompt to Claude and return the text of the answer."""
    # Fail early with a clear message if the key is missing.
    if not os.getenv("ANTHROPIC_API_KEY"):
        raise RuntimeError("ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.")

    # The client reads ANTHROPIC_API_KEY from the environment (loaded from .env above).
    client = anthropic.Anthropic()

    try:
        # We use client.beta because "fallbacks" is a beta feature:
        # if the model's safety filter wrongly declines a request, the API
        # retries it on another Claude model instead of returning nothing.
        response = client.beta.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
            output_config={"effort": EFFORT},
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
        )
    except anthropic.AuthenticationError as error:
        raise RuntimeError("Invalid or missing API key. Check ANTHROPIC_API_KEY in your .env file.") from error
    except anthropic.RateLimitError as error:
        raise RuntimeError("Rate limit reached. Wait a moment and try again.") from error
    except anthropic.APIConnectionError as error:
        raise RuntimeError("Could not reach the Anthropic API. Check your internet connection.") from error
    except anthropic.APIStatusError as error:
        raise RuntimeError(f"Anthropic API error ({error.status_code}): {error.message}") from error

    if response.stop_reason == "refusal":
        return "The model declined to answer this question."

    # The response is a list of blocks. We keep only the text blocks.
    return "".join(block.text for block in response.content if block.type == "text").strip()


def answer_question(question: str, top_k: int = TOP_K) -> dict:
    """Full pipeline: retrieve chunks, build the prompt, call the LLM."""
    chunks = retrieve(question, top_k)

    # No chunks means the database is empty. Don't waste an API call.
    if not chunks:
        return {"answer": f"{I_DONT_KNOW}. (No documents are stored yet.)", "chunks": []}

    answer = call_llm(build_prompt(question, chunks))
    return {"answer": answer, "chunks": chunks}


# Ask a question from the command line:
#   python src/query.py "What is the refund policy?"
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: python src/query.py "your question"')
        sys.exit(1)

    result = answer_question(sys.argv[1])
    print("\nANSWER:\n" + result["answer"])
    print("\nRETRIEVED CHUNKS:")
    for chunk in result["chunks"]:
        print(f"- [{chunk['source']}, page {chunk['page']}] distance={chunk['distance']:.3f}")
