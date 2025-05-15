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
    # max_length:Optional[int] = 512
    
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
        
        response = llm_engine.generate_response(full_prompt,max_length=request.max_length)
        
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
        test_prompt = "What is the capital of France?"
        test_response = llm_engine.generate_response(test_prompt,max_length=20)
        return {
            "status":"ok",
            "engine": llm_engine.model_name,
            "device": llm_engine.device,
            "test_response":test_response[:20]+"..."
        }
    except Exception as e:
        return {
            "status":"error",
            "message":str(e)
        }

    """
    Generate a response from the LLM
    """
    start_time = time.time()
    
    try:
        full_prompt = f"{request.system_instruction}\n\n{request.prompt}"
        
        response = llm_engine.generate_response(full_prompt,max_length=request.max_length)
        
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