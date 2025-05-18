
from io import BytesIO

from io import BytesIO
from zipfile import ZipFile
import fitz  # PyMuPDF
 
def pdf_to_png_zip_bytes(pdf_bytes: bytes, dpi: int = 300) -> BytesIO:
    """
    Convert each page of the PDF to a PNG at the given DPI and return
    a BytesIO wrapping a ZIP archive with page_1.png, page_2.png, …
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    zip_buf = BytesIO()
    with ZipFile(zip_buf, "w") as zf:
        for i, page in enumerate(doc, start=1):
            zoom = dpi / 72           # 72 DPI is the PDF default
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat)
            img_bytes = pix.tobytes("png")
            zf.writestr(f"page_{i}.png", img_bytes)
    zip_buf.seek(0)
    return zip_buf