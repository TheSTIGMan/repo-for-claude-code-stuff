"""
store.py - Step 3 of the pipeline.

Turns each chunk into an embedding (a list of numbers that captures its meaning)
and saves it in a ChromaDB collection on disk.

Files that are already stored are skipped, so running this twice
does not create duplicates.
"""

import logging
from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer

from chunk import chunk_pages
from ingest import DATA_DIR, PROJECT_ROOT, extract_pages

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# ---- Config ----
EMBEDDING_MODEL = "all-MiniLM-L6-v2"   # small, fast, runs locally on CPU
DB_PATH = PROJECT_ROOT / "chroma_db"   # folder where ChromaDB saves its files
COLLECTION_NAME = "documents"
BATCH_SIZE = 64                        # how many chunks to embed and save at once
# ----------------

# Loading the model takes a few seconds, so we load it once and reuse it.
_embedder: SentenceTransformer | None = None


def get_embedder() -> SentenceTransformer:
    """Load the embedding model the first time it is needed."""
    global _embedder
    if _embedder is None:
        logger.info("Loading embedding model: %s", EMBEDDING_MODEL)
        _embedder = SentenceTransformer(EMBEDDING_MODEL)
    return _embedder


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Turn a list of texts into a list of embedding vectors."""
    # normalize_embeddings=True makes every vector length 1,
    # so cosine similarity works well for comparing them.
    vectors = get_embedder().encode(texts, normalize_embeddings=True)
    return vectors.tolist()


def get_collection() -> chromadb.Collection:
    """Open (or create) the ChromaDB collection saved on disk."""
    client = chromadb.PersistentClient(path=str(DB_PATH))
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        # We create embeddings ourselves, so Chroma should not use its own model.
        embedding_function=None,
        # Compare vectors with cosine distance (0 = same meaning, higher = less similar).
        metadata={"hnsw:space": "cosine"},
    )


def get_stored_sources(collection: chromadb.Collection) -> set[str]:
    """Return the names of files that are already in the database."""
    result = collection.get(include=["metadatas"])
    return {metadata["source"] for metadata in result["metadatas"]}


def store_chunks(chunks: list[dict], collection: chromadb.Collection) -> int:
    """Embed chunks and save them. Return how many were saved."""
    # Save in batches so a large folder does not use too much memory at once.
    for start in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[start : start + BATCH_SIZE]
        collection.add(
            ids=[chunk["chunk_id"] for chunk in batch],
            embeddings=embed_texts([chunk["text"] for chunk in batch]),
            documents=[chunk["text"] for chunk in batch],
            # Metadata travels with each chunk so we can cite it later.
            metadatas=[
                {"source": chunk["source"], "page": chunk["page"], "chunk_id": chunk["chunk_id"]}
                for chunk in batch
            ],
        )
    return len(chunks)


def ingest_folder(data_dir: Path = DATA_DIR) -> int:
    """Read, chunk, embed, and store every NEW PDF in data_dir. Return chunks added."""
    if not data_dir.exists():
        raise FileNotFoundError(f"Data folder not found: {data_dir}")

    collection = get_collection()
    already_stored = get_stored_sources(collection)

    total_added = 0
    for pdf_path in sorted(data_dir.glob("*.pdf")):
        # Skip files we already stored. We check by file name.
        if pdf_path.name in already_stored:
            logger.info("Already stored, skipping: %s", pdf_path.name)
            continue

        pages = extract_pages(pdf_path)
        chunks = chunk_pages(pages)
        if not chunks:
            logger.warning("No text found in %s, nothing to store", pdf_path.name)
            continue

        added = store_chunks(chunks, collection)
        logger.info("Stored %s: %d chunks", pdf_path.name, added)
        total_added += added

    logger.info("Done. Added %d chunks. Collection now has %d chunks.",
                total_added, collection.count())
    return total_added


# Run this file directly to load your PDFs into the database:
#   python src/store.py
if __name__ == "__main__":
    ingest_folder()
