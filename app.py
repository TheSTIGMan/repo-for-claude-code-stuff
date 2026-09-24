"""
app.py - Step 6: a simple web UI with Streamlit.

Run it with:
    streamlit run app.py
"""

import sys
from pathlib import Path

import streamlit as st

# Our pipeline code lives in src/. Add it to Python's import path.
sys.path.append(str(Path(__file__).parent / "src"))

from query import answer_question  # noqa: E402  (import must come after the path change)
from store import get_collection, get_embedder, ingest_folder  # noqa: E402


@st.cache_resource
def load_model() -> None:
    """Load the embedding model once. Streamlit re-runs this script on every click,
    and cache_resource stops it from reloading the model each time."""
    get_embedder()


st.set_page_config(page_title="Cited Document Q&A", page_icon="📄")
st.title("📄 Cited Document Q&A")
st.caption("Ask a question about your PDFs. Answers cite the file and page.")

load_model()

# ---- Sidebar: database status and a button to add new PDFs ----
with st.sidebar:
    st.header("Documents")
    st.write(f"Chunks stored: **{get_collection().count()}**")
    if st.button("Ingest new PDFs from data/"):
        with st.spinner("Reading, chunking, and embedding PDFs..."):
            try:
                added = ingest_folder()
                st.success(f"Added {added} new chunks.")
            except FileNotFoundError as error:
                st.error(str(error))

# ---- Main area: question and answer ----
question = st.text_input("Your question", placeholder="What does the document say about ...?")

if st.button("Ask", type="primary") and question.strip():
    with st.spinner("Searching documents and asking the LLM..."):
        try:
            result = answer_question(question.strip())
        except RuntimeError as error:
            # query.py turns API problems into RuntimeError with a readable message.
            st.error(str(error))
            st.stop()

    st.subheader("Answer")
    st.markdown(result["answer"])

    # Show what the LLM was given, so the user can check the answer themselves.
    with st.expander(f"Retrieved chunks ({len(result['chunks'])})"):
        for number, chunk in enumerate(result["chunks"], start=1):
            st.markdown(
                f"**{number}. {chunk['source']}, page {chunk['page']}** "
                f"· distance {chunk['distance']:.3f} (lower = more similar)"
            )
            st.text(chunk["text"])
            st.divider()
