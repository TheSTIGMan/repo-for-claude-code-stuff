# Cited Document Q&A

Ask questions about your PDF documents and get answers **with citations** (file name + page number).

The app reads PDFs, splits them into chunks, stores them in a local vector database, and uses an
LLM (Claude) to answer **only** from the most relevant chunks. If the answer is not in the documents,
it says *"I don't know based on these documents"* instead of guessing.

It is built without LangChain or other RAG frameworks, so every step of the pipeline is visible
in plain Python.

## Architecture

```
                 INGESTION (run once per new PDF)
 ┌──────────┐   ┌────────────┐   ┌────────────┐   ┌──────────────────────┐
 │  data/   │──▶│ ingest.py  │──▶│  chunk.py  │──▶│      store.py        │
 │  *.pdf   │   │ text per   │   │ 500 words, │   │ embed (MiniLM-L6-v2) │
 └──────────┘   │ page       │   │ 50 overlap │   │ save to ChromaDB     │
                └────────────┘   └────────────┘   └──────────┬───────────┘
                                                             │
                                                             ▼
                                                   ┌──────────────────┐
                 QUERY (every question)            │  chroma_db/      │
 ┌──────────┐   ┌──────────────────────────────┐   │  (on disk)       │
 │ question │──▶│ query.py                     │◀──┤                  │
 └──────────┘   │ 1. embed question            │   └──────────────────┘
      ▲         │ 2. retrieve top 5 chunks     │
      │         │ 3. build prompt with sources │──▶  Claude API
      │         │ 4. answer + [file, page X]   │◀──
      │         └──────────────┬───────────────┘
      │                        ▼
 ┌────┴─────────────────────────────────┐    ┌──────────────────────────┐
 │ app.py (Streamlit UI)                │    │ evaluate.py              │
 │ question box, answer, sources panel  │    │ runs eval_questions.json │
 └──────────────────────────────────────┘    │ prints score, failures   │
                                             └──────────────────────────┘
```

| File | What it does |
|------|--------------|
| `src/ingest.py` | Reads every PDF in `data/`, extracts text per page, skips empty pages with a warning. |
| `src/chunk.py` | Splits each page into ~500-word chunks with 50 words of overlap. Keeps file, page, chunk id. |
| `src/store.py` | Embeds chunks with `all-MiniLM-L6-v2` and saves them in ChromaDB. Skips files already stored. |
| `src/query.py` | Retrieves the top 5 chunks, builds the prompt, calls Claude, returns answer + sources. |
| `src/evaluate.py` | Runs test questions and checks the answers contain the expected facts. |
| `app.py` | Streamlit page: question box, answer, and an expandable list of retrieved chunks. |

## How to run

Requires Python 3.11+.

```bash
# 1. Install dependencies
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 2. Add your API key
cp .env.example .env               # then edit .env and paste your ANTHROPIC_API_KEY

# 3. Put your PDF files in data/, then load them into the database
python src/store.py

# 4. Ask a question from the command line...
python src/query.py "What is the refund policy?"

# ...or open the web UI
streamlit run app.py

# 5. Run the evaluation (edit eval_questions.json first - see below)
python src/evaluate.py
```

Optional: set `LLM_MODEL` in `.env` to use a different Claude model (default: `claude-opus-5`).

## Evaluation

`eval_questions.json` holds test questions. Each one lists the key facts the answer must contain,
and optionally the file that must be cited:

```json
{
  "question": "What is the refund window?",
  "expected_facts": ["30 days"],
  "expected_source": "policy.pdf"
}
```

A question passes only if **every** expected fact (and the citation, if given) appears in the answer.
The file also includes one question that the documents can't answer, to check that the model says
"I don't know" instead of making something up.

**Score: _X/10_** <!-- TODO: fill in after running `python src/evaluate.py` on your documents -->

### Failure case

<!-- TODO: pick one failed question from eval_results.json and explain it. Example structure: -->
- **Question:** _..._
- **Expected:** _..._
- **Got:** _..._
- **Why it failed:** _..._ (for example: the fact was split across two chunks, the right chunk
  was not in the top 5, or the answer used different wording than the expected fact, such as
  "thirty days" vs "30 days")

## Design decisions

- **Chunk per page, not per document.** Every chunk belongs to exactly one page, so citations
  are always accurate. The trade-off: a sentence that crosses a page break is split.
- **Words instead of tokens for chunk size.** Simple and needs no tokenizer. Note that
  `all-MiniLM-L6-v2` only reads the first 256 tokens (~200 words) of each chunk, so smaller
  chunks (`CHUNK_SIZE` in `src/chunk.py`) may improve retrieval.
- **Local embeddings.** `all-MiniLM-L6-v2` runs on CPU, costs nothing, and keeps documents
  private until the final LLM call.
- **Skip already-stored files by name.** Fast and simple. The trade-off: if you edit a PDF but keep
  its name, delete the `chroma_db/` folder and re-run `python src/store.py`.
- **Strict prompt + fixed "I don't know" sentence.** Reduces hallucination and makes the
  behavior easy to test automatically.
- **Simple string-match evaluation.** Easy to understand and free to run, but it can miss correct
  answers that use different wording. An LLM-as-judge would be the next step.

## Next steps

- **OCR for scanned PDFs.** Scanned pages have no text layer, so they are currently skipped.
  Adding OCR (for example Tesseract) would make them searchable.
- **OpenSearch on AWS.** Replace local ChromaDB with a managed vector store (Amazon OpenSearch
  Service) so the app can scale and be shared by many users.
- **More file types.** Support Word (.docx), HTML, and plain text files in `ingest.py`.
- Hybrid search (keyword + vector) and a re-ranking step to improve retrieval.
- LLM-as-judge evaluation to score answers that use different wording.
