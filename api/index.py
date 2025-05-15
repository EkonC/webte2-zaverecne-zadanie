import os
import json
from typing import List
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from .utils.tools import get_current_weather
from .utils.merge_pdf import merge_pdfs_bytes


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

