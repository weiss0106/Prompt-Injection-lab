#!/bin/sh
# Wait for backend:8001 to be available
until nc -z backend 8001; do
  echo "Waiting for backend..."
  sleep 1
done
nginx -g "daemon off;"