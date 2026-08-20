from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

ROOT = Path(__file__).resolve().parent.parent


# Static folders
for folder in ["css", "js", "sample", "BulkUpload_photos"]:
    folder_path = ROOT / folder
    if folder_path.exists():
        app.mount(f"/{folder}", StaticFiles(directory=folder_path), name=folder)


@app.get("/")
def home():
    return FileResponse(ROOT / "index.html")


@app.get("/api")
def api_status():
    return {"status": "OCR API is running"}