from io import BytesIO
from zipfile import ZipFile
import fitz  # PyMuPDF

def pdf_to_jpg_zip_bytes(
    pdf_bytes: bytes,
    dpi: int = 300,
) -> BytesIO:
    """
    Convert each page of the PDF to a JPEG at the given DPI/quality,
    and bundle into a ZIP (page_1.jpg, page_2.jpg, …).
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    zip_buf = BytesIO()
    with ZipFile(zip_buf, "w") as zf:
        for i, page in enumerate(doc, start=1):
            zoom = dpi / 72  # PDF default is 72dpi
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat)
            img_bytes = pix.tobytes("jpeg")
            zf.writestr(f"page_{i}.jpg", img_bytes)
    zip_buf.seek(0)
    return zip_buf
