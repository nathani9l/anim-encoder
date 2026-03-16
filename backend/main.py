import traceback
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from encoder import pack_anim

app = FastAPI(title="Anim Encoder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/encode")
async def encode(
    files: list[UploadFile] = File(...),
    fps: float = Form(30.0),
    quality: int = Form(65),
    loop: bool = Form(True),
):
    if not files:
        raise HTTPException(400, "No files uploaded")
    if not all(f.filename.lower().endswith(".png") for f in files):
        raise HTTPException(400, "All files must be PNG")
    if not (1 <= quality <= 100):
        raise HTTPException(400, "quality must be 1-100")
    if not (1 <= fps <= 120):
        raise HTTPException(400, "fps must be 1-120")

    named = sorted(
        [(f.filename, await f.read()) for f in files],
        key=lambda x: x[0],
    )
    frames_data = [d for _, d in named]

    try:
        anim_bytes, stats = pack_anim(frames_data, fps, quality, loop)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, f"Encoding failed: {e}")

    return Response(
        content=anim_bytes,
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": 'attachment; filename="animation.uxuitelno"',
            "X-Anim-Stats": str(stats),
        },
    )


@app.get("/api/health")
def health():
    return {"status": "ok"}
