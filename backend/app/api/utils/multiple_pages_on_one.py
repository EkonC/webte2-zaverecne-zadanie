from io import BytesIO
from pypdf import PdfReader, PdfWriter, Transformation

def n_up_pdf_bytes(
    pdf_bytes: bytes,
    cols: int = 4,
    rows: int = 4
) -> BytesIO:
    """
    Take the first page of the input PDF and tile it in a grid of
    `cols`×`rows` on a single new page.
    
    Returns a BytesIO containing the new PDF.
    """
    reader = PdfReader(BytesIO(pdf_bytes))
    src = reader.pages[0]
    
    # source dimensions
    w = float(src.mediabox.width)
    h = float(src.mediabox.height)
    
    # create new PDF + blank page sized to hold the grid
    writer = PdfWriter()
    dest = writer.add_blank_page(width=w * cols, height=h * rows)
    
    # tile it
    for x in range(cols):
        for y in range(rows):
            dest.merge_transformed_page(
                src,
                Transformation().translate(x * w, y * h)
            )
    
    out = BytesIO()
    writer.write(out)
    out.seek(0)
    return out
