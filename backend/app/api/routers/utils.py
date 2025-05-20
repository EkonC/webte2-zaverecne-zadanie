from fastapi import APIRouter, Body, HTTPException
from fastapi.responses import StreamingResponse
import io
import pdfkit

router = APIRouter(prefix="/utils", tags=["utils"])

DEFAULT_OPTIONS = {
    "page-size": "A4",
    "margin-top": "20mm",
    "margin-right": "20mm",
    "margin-bottom": "20mm",
    "margin-left": "20mm",
    "disable-smart-shrinking": "",
    "print-media-type": "",
    "no-background": "",
    "encoding": "UTF-8",
}


@router.post(
    "/html-to-pdf",
    summary="Vyrenderuje zadané HTML do PDF (A4, okraje 20 mm)",
    response_description="PDF súbor",
)
async def html_to_pdf(
    html: str = Body(..., media_type="text/plain"),
):
    """
    Prijme **HTML (string)** a vráti PDF.
    """
    try:
        pdf_bytes: bytes = pdfkit.from_string(html, False, options=DEFAULT_OPTIONS)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="user-manual.pdf"'},
    )

