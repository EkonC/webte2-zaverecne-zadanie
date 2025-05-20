# vstupný bod aplikácie (Fast API)

from fastapi import FastAPI, APIRouter

from fastapi.middleware.cors import CORSMiddleware

from app.api.routers.auth import router as auth_router
from app.api.routers.pdf import router as pdf_router
from app.api.routers.history import router as history_router
from app.api.routers.utils import router as utils_router
from app.startup import lifespan

app = FastAPI(
    title="PDF Service API",
    version="1.0.0",
    description="Back-end pre PDF úpravy",
    docs_url="/api/v1/docs",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan,
)

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = APIRouter(prefix="/api/v1")

api.include_router(auth_router)
api.include_router(pdf_router)
api.include_router(history_router)
api.include_router(utils_router)

app.include_router(api)

@api.get("/", tags=["health"])
async def read_root():
    return {"status": "ok", "message": "API beží 🚀"}