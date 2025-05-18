# vstupný bod aplikácie (Fast API)

from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from app.api.routers.auth import router as auth_router
from app.api.routers.pdf import router as pdf_router
from app.api.routers.history import router as history_router
from app.startup import lifespan

app = FastAPI(
    title="PDF Service API",
    version="1.0.0",
    description="Back-end pre PDF úpravy",
    lifespan=lifespan,
)

# for development purposes only
origins = [
    "http://localhost:3000",  # Your Next.js frontend URL
    # Add any other frontend origins if necessary
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(pdf_router)
app.include_router(history_router)

@app.get("/", tags=["health"])
async def read_root():
    return {"status": "ok", "message": "API beží 🚀"}