#!/bin/sh

# Start Ollama server in the background
ollama serve &

# Wait for the server to start
sleep 10

# Pull the model
ollama pull llama3.2:1b

# Keep the container running
wait 