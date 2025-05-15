# vstupný bod aplikácie (Fast API)

from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def read_root():
    return {"status": "ok", "message": "API beží 🚀"}