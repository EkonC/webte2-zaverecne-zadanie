from typing import List
from fastapi import UploadFile, File, Form, HTTPException, APIRouter, Depends
from fastapi.responses import StreamingResponse, JSONResponse
from io import BytesIO
from zipfile import ZipFile

from app.api.dependencies import make_history_dep
from app.api.utils.merge_pdf import merge_pdfs_bytes
from app.api.utils.extract_text import extract_text_from_pdf_bytes
from app.api.utils.extract_images import extract_images_from_pdf_bytes
from app.core.security import get_current_active_user
from app.api.utils.remove_pages import remove_pages_bytes
from app.api.utils.split_pdf import (
    split_by_range_bytes,
    split_by_interval_bytes,
    extract_pages_bytes,
)

router = APIRouter(
    prefix="/pdf",
    tags=["pdf"],
    dependencies=[Depends(get_current_active_user)]
)


@router.post("/merge-pdf",
             dependencies=[Depends(make_history_dep("merge_pdf"))])
async def merge_pdf_endpoint(
    files: List[UploadFile] = File(..., description="Select two or more PDF files")
):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least two PDFs are required to merge.")

    # Read all uploaded PDFs into memory
    file_bytes = [await f.read() for f in files]

    # Merge them
    merged_io = merge_pdfs_bytes(file_bytes)

    # Stream back as a downloadable PDF
    return StreamingResponse(
        merged_io,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="merged.pdf"'}
    )

@router.post("/extract-text",
             dependencies=[Depends(make_history_dep("extract_text"))])
async def extract_text_endpoint(
    file: UploadFile = File(..., description="Select one PDF to extract from"),
    page_range: str = Form("", description="e.g. '1-3,5-7'"),
    preserve_layout: bool = Form(False, description="Keep horizontal layout")
):
    content = await file.read()
    text = extract_text_from_pdf_bytes(content, page_range, preserve_layout)
    return JSONResponse({"text": text})

@router.post("/extract-images",
             dependencies=[Depends(make_history_dep("extract_images"))])
async def extract_images_endpoint(
    file: UploadFile = File(..., description="Select one PDF"),
    page_range: str = Form("", description="e.g. '1-3,5-7'"),
    image_format: str = Form("all", description="jpeg, png, or all"),
    min_width: int = Form(0, description="Min image width in px"),
    min_height: int = Form(0, description="Min image height in px")
):
    # Add debug print
    print(f"Received min_width={min_width}, min_height={min_height}")
    content = await file.read()
    zip_io, count = extract_images_from_pdf_bytes(
        content, page_range, image_format, min_width, min_height
    )
    return StreamingResponse(
        zip_io,
        media_type="application/zip",
        headers={
            "Content-Disposition": 'attachment; filename="images.zip"',
            "x-image-count": str(count)
        }
    )

@router.post(
    "/remove-pages",
    dependencies=[Depends(make_history_dep("remove_pages"))]
)
async def remove_pages_endpoint(
    file: UploadFile = File(
        ..., description="Select one PDF to remove pages from"
    ),
    page_range: str = Form(
        "", description="e.g. '1-3,5-7' pages to delete"
    ),
):
    """
    Delete the given pages from a single PDF and return the new PDF.
    """
    content = await file.read()
    modified_pdf = remove_pages_bytes(content, page_range)
    return StreamingResponse(
        modified_pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="modified.pdf"'
        }
    )

@router.post(
    "/split-pdf",
    dependencies=[Depends(make_history_dep("split_pdf"))]
)
async def split_pdf_endpoint(
    file: UploadFile = File(..., description="Select one PDF to split"),
    split_method: str = Form("range", description="range, interval or extract"),
    page_range: str = Form("", description="e.g. '1-3,5-7'"),
    interval: int = Form(1, description="Pages per chunk"),
    extract_option: str = Form("all", description="all, even, or odd")
):
    content = await file.read()

    if split_method == "range":
        parts = split_by_range_bytes(content, page_range)
    elif split_method == "interval":
        parts = split_by_interval_bytes(content, interval)
    elif split_method == "extract":
        parts = extract_pages_bytes(content, extract_option)
    else:
        raise HTTPException(status_code=400, detail="Invalid split method")

    zip_io = BytesIO()
    with ZipFile(zip_io, "w") as zf:
        for idx, part in enumerate(parts, start=1):
            zf.writestr(f"part_{idx}.pdf", part.getvalue())
    zip_io.seek(0)

    return StreamingResponse(
        zip_io,
        media_type="application/zip",
        headers={"Content-Disposition": 'attachment; filename="split.zip"'}
    )

