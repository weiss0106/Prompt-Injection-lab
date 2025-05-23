from fastapi import APIRouter,HTTPException
from pydantic import BaseModel
from app.llm.loader import LLMEngine
from typing import Optional
import uuid
import time

router = APIRouter()
llm_engine = LLMEngine()

class PromptRequest(BaseModel):
    """LLM API Request"""
    prompt:str
    system_instruction:Optional[str] = "You are a helpful assistant."
    max_tokens:Optional[int] = 64
    
class PromptResponse(BaseModel):
    """LLM API Response"""
    response_id:str
    response:str
    processing_time:float

@router.post("/generate",response_model=PromptResponse)
async def generate_response(request:PromptRequest):
    """
    Generate a response from the LLM
    """
    start_time = time.time()
    
    try:
        full_prompt = f"{request.system_instruction}\n\n{request.prompt}"
        
        response = llm_engine.generate_response(full_prompt)
        
        processing_time = time.time() - start_time
        
        result = PromptResponse(
            response_id=str(uuid.uuid4()),
            response=response,
            processing_time=processing_time
        )
        
        return result
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Model generation failed: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """
    Check the health of the LLM API
    """
    try:
        # Load model if not already loaded
        if llm_engine.model is None:
            model_loaded = llm_engine.load_model()
            if not model_loaded:
                return {
                    "status": "error",
                    "message": "Failed to load the model"
                }
                
        test_prompt = "What is the capital of France?"
        test_response = llm_engine.generate_response(test_prompt)
        return {
            "status": "ok",
            "engine": llm_engine.model_name,
            "model_path": llm_engine.model_path,
            "test_response": test_response[:20]+"..." if test_response else "No response"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }        