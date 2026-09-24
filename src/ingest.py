"""
ingest.py - Step 1 of the pipeline.

Reads every PDF in the data/ folder and extracts the text page by page.
We keep the page number for each page so we can cite it later.

Output: a list of dicts, one per non-empty page:
    {"source": "report.pdf", "page": 3, "text": "..."}
"""

import logging
from pathlib import Path

from pypdf import PdfReader

# Basic logging setup: prints messages like "WARNING: ..." to the terminal.
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# Default folder that holds the PDFs.
# Built from this file's location, so it works no matter which folder you run from.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"


def extract_pages(pdf_path: Path) -> list[dict]:
    """Extract text from one PDF. Return one dict per non-empty page."""
    pages: list[dict] = []

    try:
        reader = PdfReader(pdf_path)
    except Exception as error:
        # A broken or encrypted file should not stop the whole run.
        logger.error("Could not open %s: %s", pdf_path.name, error)
        return pages

    # enumerate(..., start=1) so page numbers match what a human sees (page 1, not page 0).
    for page_number, page in enumerate(reader.pages, start=1):
        try:
            text = page.extract_text() or ""
        except Exception as error:
            logger.warning("Could not read %s page %d: %s", pdf_path.name, page_number, error)
            continue

        text = text.strip()

        # Empty pages (blank or scanned images with no text layer) are skipped.
        if not text:
            logger.warning("Skipping empty page: %s page %d", pdf_path.name, page_number)
            continue

        pages.append({"source": pdf_path.name, "page": page_number, "text": text})

    return pages


def load_pdfs(data_dir: Path = DATA_DIR) -> list[dict]:
    """Read every PDF in data_dir and return all non-empty pages."""
    if not data_dir.exists():
        raise FileNotFoundError(f"Data folder not found: {data_dir}")

    # sorted() gives a stable order, which makes results repeatable.
    pdf_files = sorted(data_dir.glob("*.pdf"))
    if not pdf_files:
        logger.warning("No PDF files found in %s", data_dir)
        return []

    all_pages: list[dict] = []
    for pdf_path in pdf_files:
        pages = extract_pages(pdf_path)
        logger.info("Loaded %s: %d pages with text", pdf_path.name, len(pages))
        all_pages.extend(pages)

    return all_pages


# Run this file directly to check that ingestion works:
#   python src/ingest.py
if __name__ == "__main__":
    pages = load_pdfs()
    print(f"\nTotal pages with text: {len(pages)}")
    if pages:
        first = pages[0]
        print(f"First page -> {first['source']}, page {first['page']}")
        print(first["text"][:300])
