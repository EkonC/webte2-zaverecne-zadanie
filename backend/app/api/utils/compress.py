from io import BytesIO
from typing import Optional
from pypdf import PdfReader, PdfWriter

def compress_pdf_bytes(
    pdf_bytes: bytes,
    remove_duplicates: bool = True,
    remove_images: bool = False,
    reduce_image_quality: Optional[int] = None,
) -> BytesIO:
    """
    Take raw PDF bytes and return a BytesIO of the compressed PDF.
    
    - remove_duplicates: merge identical objects & drop unused ones
    - remove_images: strip out all images
    - reduce_image_quality: re-encode images at given JPEG quality

    Based on the techniques in:
    https://pypdf.readthedocs.io/en/latest/user/file-size.html
    """
    reader = PdfReader(BytesIO(pdf_bytes))
    writer = PdfWriter()

    # re-build pages from reader
    for page in reader.pages:
        writer.add_page(page)

    # re-encode images at given JPEG quality, if requested
    if reduce_image_quality is not None:
        for page in writer.pages:
            for img in page.images:
                img.replace(img.image, quality=reduce_image_quality)

    # strip images if requested
    if remove_images:
        writer.remove_images()

    # merge identical objects & drop orphans
    if remove_duplicates:
        writer.compress_identical_objects(remove_identicals=True, remove_orphans=True)

    out = BytesIO()
    writer.write(out)
    out.seek(0)
    return out
