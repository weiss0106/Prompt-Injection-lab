from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import llmapi, attacker
from app.llm.loader import LLMEngine

app = FastAPI(title="Prompt Injection Lab")

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# 初始化和加载模型
llm_engine = LLMEngine()
llm_engine.load_model()  # 尝试加载模型

# 注册路由
app.include_router(llmapi.router)
app.include_router(attacker.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Prompt Injection Lab"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

