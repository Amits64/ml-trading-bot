# main.py
import os
from fastapi import FastAPI, File, UploadFile
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
from PIL import Image
import numpy as np
import cv2
import io

app = FastAPI()
model = YOLO("yolov8s.pt")  # or path to your trained model

static_dir = os.getenv("STATIC_DIR", "static")
app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")


@app.post("/detect")
async def detect_pattern(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    image_np = np.array(image)

    results = model(image_np)
    labels = results[0].names
    detections = []

    for box in results[0].boxes.data.tolist():
        x1, y1, x2, y2, conf, cls = box
        detections.append({
            "label": labels[int(cls)],
            "confidence": round(conf, 2),
            "box": [x1, y1, x2, y2]
        })

    return {"detections": detections}
