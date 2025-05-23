from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import attacker
import requests

from app.api.routes import defender

app = FastAPI(title="Prompt Injection Lab")

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Check if Ollama is running
try:
    response = requests.get("http://localhost:11434/api/tags")
    if response.status_code != 200:
        print("Warning: Ollama failed")
except Exception:
    print("Warning: Ollama is unavailable,please try ollama serve to restart")

# Register routes
#app.include_router(llmapi.router)
app.include_router(attacker.router)
app.include_router(defender.router)
@app.get("/")
def read_root():
    return {"message": "Welcome to the Prompt Injection Lab"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

