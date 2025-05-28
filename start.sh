#!/bin/bash

# Start nginx
nginx

# Start Ollama in the background
ollama serve &

# Start backend
cd /app/backend
uvicorn app.main:app --host 0.0.0.0 --port 8001 