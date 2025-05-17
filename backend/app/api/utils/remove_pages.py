from io import BytesIO
from typing import List, Optional
from pypdf import PdfReader, PdfWriter
from app.api.utils.extract_text import _parse_page_ranges

def remove_pages_bytes(
    pdf_bytes: bytes,
    page_range: Optional[str] = None
) -> BytesIO:
    """
    Remove the specified pages from a PDF byte-stream.
    page_range is a string like "1-3,5" indicating pages to delete.
    Returns the modified PDF as BytesIO.
    """
    reader = PdfReader(BytesIO(pdf_bytes))
    total = len(reader.pages)
    # parse 1-based page numbers into zero-based indices to remove
    remove_indices = set(_parse_page_ranges(page_range, total))

    writer = PdfWriter()
    # copy only pages not slated for removal
    for idx, page in enumerate(reader.pages):
        if idx not in remove_indices:
            writer.add_page(page)

    output = BytesIO()
    writer.write(output)
    output.seek(0)
    return output
