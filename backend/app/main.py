from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Prompt Injection Lab")

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Prompt Injection Lab"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app,host='0.0.0.00', port=8001)

