from io import BytesIO
from typing import List, Optional
from pypdf import PdfReader

def _parse_page_ranges(range_str: Optional[str], total: int) -> List[int]:
    if not range_str:
        return list(range(total))
    pages = set()
    for part in range_str.split(","):
        part = part.strip()
        if "-" in part:
            start, end = part.split("-", 1)
            pages.update(range(int(start) - 1, int(end)))
        else:
            pages.add(int(part) - 1)
    return sorted(p for p in pages if 0 <= p < total)

def extract_text_from_pdf_bytes(
    pdf_bytes: bytes,
    page_range: Optional[str] = None,
    preserve_layout: bool = False
) -> str:
    """
    Merge the extracted text from the given PDF bytes,
    optionally limiting to a page_range like "1-3,5", and
    preserving layout if requested.
    """
    reader = PdfReader(BytesIO(pdf_bytes))
    pages = _parse_page_ranges(page_range, len(reader.pages))
    text_chunks = []
    for idx in pages:
        page = reader.pages[idx]
        # layout_mode_space_vertically=False will preserve horizontal layout
        text = page.extract_text(layout_mode_space_vertically=not preserve_layout)
        text_chunks.append(text or "")
    return "\n\n".join(text_chunks)