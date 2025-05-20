# vstupný bod aplikácie (Fast API)

from fastapi import FastAPI, APIRouter

from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.core.config import settings
from app.api.routers.auth import router as auth_router
from app.api.routers.pdf import router as pdf_router
from app.api.routers.history import router as history_router
from app.api.routers.utils import router as utils_router
from app.startup import lifespan

API_PREFIX = settings.API_PREFIX

app = FastAPI(
    title="PDF Service API",
    version="1.0.0",
    description="Back-end pre PDF úpravy",
    docs_url=f"{API_PREFIX}/docs",
    openapi_url=f"{API_PREFIX}/openapi.json",
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

app.include_router(auth_router,     prefix=API_PREFIX)
app.include_router(pdf_router,      prefix=API_PREFIX)
app.include_router(history_router,  prefix=API_PREFIX)
app.include_router(utils_router,    prefix=API_PREFIX)

@app.get(f"{API_PREFIX}/", tags=["health"])
async def read_root():
    return {"status": "ok", "message": "API beží 🚀"}

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    try:
        flows = schema["components"]["securitySchemes"]["OAuth2PasswordBearer"]["flows"]
        flows["password"]["tokenUrl"] = f"{settings.API_PREFIX}/auth/login"
    except KeyError:
        pass

    app.openapi_schema = schema
    return app.openapi_schema

app.openapi = custom_openapi