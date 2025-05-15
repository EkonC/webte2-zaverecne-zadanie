from io import BytesIO
from typing import List, Optional, Tuple
from zipfile import ZipFile
from pypdf import PdfReader
from PIL import Image

def _parse_page_ranges(range_str: Optional[str], total: int) -> List[int]:
    """Parse a page-range string like "1-3,5" into zero-based page indices."""
    if not range_str:
        return list(range(total))
    pages = set()
    for part in range_str.split(","):
        part = part.strip()
        if "-" in part:
            start, end = part.split("-", 1)
            try:
                start_i = max(int(start) - 1, 0)
                end_i = min(int(end), total)
                pages.update(range(start_i, end_i))
            except ValueError:
                continue
        else:
            try:
                idx = int(part) - 1
                if 0 <= idx < total:
                    pages.add(idx)
            except ValueError:
                continue
    return sorted(pages)

def extract_images_from_pdf_bytes(
    pdf_bytes: bytes,
    page_range: Optional[str] = None,
    image_format: str = "all",
    min_width: int = 0,
    min_height: int = 0,
) -> Tuple[BytesIO, int]:
    """Extract images from PDF bytes, apply filters, and return as ZIP archive."""
    reader = PdfReader(BytesIO(pdf_bytes))
    pages = _parse_page_ranges(page_range, len(reader.pages))
    output = BytesIO()
    count = 0

    with ZipFile(output, "w") as zipf:
        for page_index in pages:
            page = reader.pages[page_index]
            for img_index, img in enumerate(page.images):
                # Get dimensions directly from the image data using PIL
                width, height = 0, 0
                try:
                    with Image.open(BytesIO(img.data)) as pil_img:
                        width, height = pil_img.size
                except:
                    pass
                
                # Apply dimension filter
                if width < min_width or height < min_height:
                    continue

                # Apply format filter
                ext = (img.name.split(".")[-1] if img.name else "bin").lower()
                if image_format != "all" and ext != image_format:
                    continue

                # Add to ZIP
                filename = f"page{page_index+1}_img{img_index+1}.{ext}"
                zipf.writestr(filename, img.data)
                count += 1

    output.seek(0)
    return output, count