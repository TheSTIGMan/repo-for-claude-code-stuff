"""
chunk.py - Step 2 of the pipeline.

Splits page text into smaller, overlapping chunks of words.
Each chunk keeps its metadata (source file, page number, chunk id)
so the answer can cite exactly where it came from.

Input:  pages from ingest.py -> {"source", "page", "text"}
Output: chunks -> {"chunk_id", "source", "page", "text"}
"""

# ---- Config: change these to experiment with chunking ----
CHUNK_SIZE = 500      # words per chunk
CHUNK_OVERLAP = 50    # words shared between one chunk and the next
# ----------------------------------------------------------


def split_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into chunks of `chunk_size` words, with `overlap` words repeated between chunks."""
    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than 0")
    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap must be between 0 and chunk_size - 1")

    words = text.split()  # split on any whitespace (spaces, newlines, tabs)
    chunks: list[str] = []

    # Each new chunk starts (chunk_size - overlap) words after the last one.
    # Example with size 500, overlap 50: chunks start at word 0, 450, 900, ...
    step = chunk_size - overlap
    for start in range(0, len(words), step):
        chunk_words = words[start : start + chunk_size]
        chunks.append(" ".join(chunk_words))

        # Stop once this chunk reaches the end of the text,
        # so we don't create a tiny extra chunk made only of overlap words.
        if start + chunk_size >= len(words):
            break

    return chunks


def chunk_pages(pages: list[dict], chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[dict]:
    """Turn a list of pages into a list of chunks with metadata."""
    chunks: list[dict] = []

    for page in pages:
        # We chunk each page separately, so every chunk belongs to exactly
        # one page. That keeps the citation [file, page X] accurate.
        for index, text in enumerate(split_text(page["text"], chunk_size, overlap)):
            chunks.append(
                {
                    # A stable, readable id, e.g. "report.pdf-p3-c0".
                    # The same input always gives the same id, which store.py
                    # uses to avoid storing duplicates.
                    "chunk_id": f"{page['source']}-p{page['page']}-c{index}",
                    "source": page["source"],
                    "page": page["page"],
                    "text": text,
                }
            )

    return chunks


# Run this file directly to check that chunking works:
#   python src/chunk.py
if __name__ == "__main__":
    from ingest import load_pdfs

    pages = load_pdfs()
    chunks = chunk_pages(pages)
    print(f"\n{len(pages)} pages -> {len(chunks)} chunks "
          f"(size={CHUNK_SIZE} words, overlap={CHUNK_OVERLAP} words)")
    for chunk in chunks[:3]:
        word_count = len(chunk["text"].split())
        print(f"- {chunk['chunk_id']}: {word_count} words | {chunk['text'][:80]}...")
