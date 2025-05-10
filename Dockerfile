# -------------------------
# Stage 1: Build Frontend
# -------------------------
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm start


# --------------------------
# Stage 2: Backend + Frontend
# --------------------------
FROM python:3.10-slim AS backend-runtime

# Install necessary system packages
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend Python code and root-level files
COPY backend/ /app/backend
COPY main.py /app/main.py

# Install Python dependencies
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn[standard] \
    transformers \
    ultralytics \
    opencv-python-headless \
    python-multipart

# Copy frontend build from stage 1
COPY --from=frontend-builder /app/frontend/dist /app/static

# Serve frontend via FastAPI
ENV STATIC_DIR=/app/static

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
