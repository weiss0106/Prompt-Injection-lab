from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
import requests
import json

# 创建应用
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时无需加载模型，Ollama 会处理
    print("Starting model server using Ollama...")
    yield
    print("Shutting down...")

# 传递 lifespan 到 FastAPI
app = FastAPI(title="Model Server", lifespan=lifespan)

# Ollama 配置
OLLAMA_API_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama2"  # 或 "llama2:7b-chat-q4_0", "mistral" 等

# 添加 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptRequest(BaseModel):
    prompt: str

@app.post("/generate")
async def generate(request: PromptRequest):
    try:
        # 准备请求数据
        data = {
            "model": MODEL_NAME,
            "prompt": request.prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "max_tokens": 150
            }
        }
        
        # 发送请求到 Ollama
        response = requests.post(OLLAMA_API_URL, json=data)
        
        if response.status_code == 200:
            result = response.json()
            # Ollama 响应中的 response 字段包含生成的文本
            return {"response": result.get("response", "")}
        else:
            error_message = f"Ollama API error: {response.status_code} - {response.text}"
            print(error_message)
            raise HTTPException(status_code=500, detail=error_message)
            
    except Exception as e:
        error_message = f"Failed to generate response: {str(e)}"
        print(error_message)
        raise HTTPException(status_code=500, detail=error_message)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080) 