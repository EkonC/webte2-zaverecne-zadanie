from io import BytesIO
from typing import List
from pypdf import PdfReader, PdfWriter

def merge_pdfs_bytes(file_bytes_list: List[bytes]) -> BytesIO:
    """
    Merge a list of PDF byte‐streams into a single PDF, returned as a BytesIO.
    """
    writer = PdfWriter()
    for content in file_bytes_list:
        reader = PdfReader(BytesIO(content))
        for page in reader.pages:
            writer.add_page(page)

    output = BytesIO()
    writer.write(output)
    output.seek(0)
    return output