# Build frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Build backend
FROM python:3.9-slim as backend-build
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    wget \
    libopenblas-dev \
    && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

# Final image
FROM python:3.9-slim
WORKDIR /app

# Install nginx and netcat
RUN apt-get update && apt-get install -y nginx netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Copy backend
COPY --from=backend-build /app/backend /app/backend

# Copy frontend build to a static dir
COPY --from=frontend-build /app/frontend/dist /app/frontend_dist

# Copy nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Create wait-for-backend.sh script
RUN echo '#!/bin/sh\n\
echo "Waiting for backend..."\n\
while ! nc -z backend 8001; do\n\
  sleep 1\n\
done\n\
echo "Backend is up!"\n\
nginx -g "daemon off;"' > /app/wait-for-backend.sh && \
chmod +x /app/wait-for-backend.sh

# Install Python dependencies
WORKDIR /app/backend
RUN pip install --no-cache-dir -r requirements.txt

# Expose ports for backend and frontend
EXPOSE 8001 5174

# Set the entrypoint
ENTRYPOINT ["/app/wait-for-backend.sh"]