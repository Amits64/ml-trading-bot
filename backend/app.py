from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import numpy as np
import io

app = FastAPI()

# Correct CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the YOLOv8s model
model = YOLO("model.pt")  # Make sure this path is correct inside Docker too


@app.post("/detect")
async def detect_pattern(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    image_np = np.array(image)

    results = model(image_np)
    detections = []

    for box in results[0].boxes.data.tolist():
        x1, y1, x2, y2, conf, cls = box
        label = results[0].names[int(cls)]
        detections.append({
            "label": label,
            "confidence": round(conf, 2),
            "box": [x1, y1, x2, y2]
        })

    return {"detections": detections}
