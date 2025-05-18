from io import BytesIO
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

def add_watermark_bytes(
    pdf_bytes: bytes,
    watermark_bytes: bytes,
    over: bool = False,
) -> BytesIO:
    """
    Stamp or watermark a PDF:
      - pdf_bytes: original PDF data
      - watermark_bytes: PDF data whose first page will be used as the stamp
      - over: True to overlay (stamp), False to underlay (watermark)

    Based on pypdf's "Stamp (Overlay) / Watermark (Underlay)" guide:
    https://pypdf.readthedocs.io/en/latest/user/add-watermark.html
    """
    reader = PdfReader(BytesIO(pdf_bytes))
    stamp_reader = PdfReader(BytesIO(watermark_bytes))
    stamp_page = stamp_reader.pages[0]

    writer = PdfWriter()
    # copy all pages from the original
    for page in reader.pages:
        writer.add_page(page)

    # merge the stamp onto/under each page
    for page in writer.pages:
        page.merge_page(stamp_page, over=over)

    out = BytesIO()
    writer.write(out)
    out.seek(0)
    return out

def create_text_watermark_pdf(
    text: str,
    color_hex: str,
    font_size: int,
    opacity: float,
    rotation: float,
    position: str,
    page_width: float,
    page_height: float,
) -> bytes:
    """
    Render `text` onto a blank PDF of size (page_width, page_height),
    using the given color, font_size, opacity, rotation and position.
    Returns raw PDF bytes.
    """
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=(page_width, page_height))
    c.setFont("Helvetica", font_size)
    c.setFillColor(HexColor(color_hex))
    # set transparency if supported
    try:
        c.setFillAlpha(opacity)
    except AttributeError:
        pass

    # measure text
    text_width = c.stringWidth(text, "Helvetica", font_size)
    # compute x,y
    positions = {
        "center": ((page_width - text_width) / 2, page_height / 2),
        "topLeft": (0, page_height - font_size),
        "topCenter": ((page_width - text_width) / 2, page_height - font_size),
        "topRight": (page_width - text_width, page_height - font_size),
        "bottomLeft": (0, 0),
        "bottomCenter": ((page_width - text_width) / 2, 0),
        "bottomRight": (page_width - text_width, 0),
    }
    x, y = positions.get(position, positions["center"])

    c.saveState()
    c.translate(x, y)
    c.rotate(rotation)
    c.drawString(0, 0, text)
    c.restoreState()
    c.showPage()
    c.save()

    return buf.getvalue()

def add_text_watermark_bytes(
    pdf_bytes: bytes,
    text: str,
    color_hex: str = "#888888",
    font_size: int = 48,
    opacity: float = 0.3,
    rotation: float = 45,
    position: str = "center",
) -> BytesIO:
    """
    Build a text-watermark page in memory and merge it over/under each page.
    """
    reader = PdfReader(BytesIO(pdf_bytes))
    # use first page size for all
    first = reader.pages[0]
    w = float(first.mediabox.width)
    h = float(first.mediabox.height)

    wm_pdf = create_text_watermark_pdf(
        text, color_hex, font_size, opacity, rotation, position, w, h
    )
    # reuse existing PDF-to-PDF stamp logic
    return add_watermark_bytes(pdf_bytes, wm_pdf, over=False)
