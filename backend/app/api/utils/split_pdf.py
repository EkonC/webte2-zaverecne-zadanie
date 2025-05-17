from io import BytesIO
from typing import List
from pypdf import PdfReader, PdfWriter

def split_by_range_bytes(
    pdf_bytes: bytes,
    range_str: str
) -> List[BytesIO]:
    reader = PdfReader(BytesIO(pdf_bytes))
    total = len(reader.pages)
    outputs: List[BytesIO] = []
    for part in [p.strip() for p in range_str.split(",") if p.strip()]:
        if "-" in part:
            start_str, end_str = part.split("-", 1)
            start = max(int(start_str) - 1, 0)
            end = min(int(end_str) - 1, total - 1)
            indices = list(range(start, end + 1))
        else:
            idx = int(part) - 1
            if 0 <= idx < total:
                indices = [idx]
            else:
                continue
        writer = PdfWriter()
        for i in indices:
            writer.add_page(reader.pages[i])
        out = BytesIO()
        writer.write(out)
        out.seek(0)
        outputs.append(out)
    return outputs

def split_by_interval_bytes(
    pdf_bytes: bytes,
    interval: int
) -> List[BytesIO]:
    reader = PdfReader(BytesIO(pdf_bytes))
    total = len(reader.pages)
    outputs: List[BytesIO] = []
    for start in range(0, total, interval):
        writer = PdfWriter()
        for i in range(start, min(start + interval, total)):
            writer.add_page(reader.pages[i])
        out = BytesIO()
        writer.write(out)
        out.seek(0)
        outputs.append(out)
    return outputs

def extract_pages_bytes(
    pdf_bytes: bytes,
    option: str
) -> List[BytesIO]:
    reader = PdfReader(BytesIO(pdf_bytes))
    total = len(reader.pages)
    outputs: List[BytesIO] = []
    for idx in range(total):
        page_num = idx + 1
        if option == "even" and (page_num % 2 != 0):
            continue
        if option == "odd" and (page_num % 2 != 1):
            continue
        writer = PdfWriter()
        writer.add_page(reader.pages[idx])
        out = BytesIO()
        writer.write(out)
        out.seek(0)
        outputs.append(out)
    return outputs
