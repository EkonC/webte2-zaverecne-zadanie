import os
import json
from typing import List
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from .utils.tools import get_current_weather
from .utils.merge_pdf import merge_pdfs_bytes
from .utils.extract_text import extract_text_from_pdf_bytes


load_dotenv(".env.local")

app = FastAPI()

@app.post("/api/merge-pdf")
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

@app.post("/api/extract-text")
async def extract_text_endpoint(
    file: UploadFile = File(..., description="Select one PDF to extract from"),
    page_range: str = Form("", description="e.g. '1-3,5-7'"),
    preserve_layout: bool = Form(False, description="Keep horizontal layout")
):
    content = await file.read()
    text = extract_text_from_pdf_bytes(content, page_range, preserve_layout)
    return JSONResponse({"text": text})

