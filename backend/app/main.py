# vstupný bod aplikácie (Fast API)

from fastapi import FastAPI

from app.api.routers.auth import router as auth_router
from app.api.routers.pdf import router as pdf_router

app = FastAPI(
    title="PDF Service API",
    version="1.0.0",
    description="Back-end pre PDF úpravy"
)

app.include_router(auth_router)
app.include_router(pdf_router)

@app.get("/", tags=["health"])
async def read_root():
    return {"status": "ok", "message": "API beží 🚀"}