from typing import List
from fastapi import UploadFile, File, Form, HTTPException, APIRouter
from fastapi.responses import StreamingResponse, JSONResponse
from app.api.utils.merge_pdf import merge_pdfs_bytes
from app.api.utils.extract_text import extract_text_from_pdf_bytes
from app.api.utils.extract_images import extract_images_from_pdf_bytes

router = APIRouter(prefix="/pdf", tags=["pdf"])


@router.post("/merge-pdf")
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

@router.post("/extract-text")
async def extract_text_endpoint(
    file: UploadFile = File(..., description="Select one PDF to extract from"),
    page_range: str = Form("", description="e.g. '1-3,5-7'"),
    preserve_layout: bool = Form(False, description="Keep horizontal layout")
):
    content = await file.read()
    text = extract_text_from_pdf_bytes(content, page_range, preserve_layout)
    return JSONResponse({"text": text})

@router.post("/extract-images")
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

