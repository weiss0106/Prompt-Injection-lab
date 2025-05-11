from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.llm.loader import LLMEngine
from typing import Optional

router = APIRouter()
llm_engine = LLMEngine()

class PromptRequest(BaseModel):
    prompt: str
    system_instruction: Optional[str] = "You are a helpful assistant."

class PromptResponse(BaseModel):
    response:str

@router.post("/generate", response_model=PromptResponse)
def generate_response(request: PromptRequest):
    """
    Generate a response from the LLM based on the provided prompt.
    Args:
        request (PromptRequest): The request containing the prompt and system instruction.
    Returns:
        PromptResponse: The generated response from the LLM.
    """
    try:
        # Combine system instruction and user prompt
        full_prompt = f"{request.system_instruction}\n{request.prompt}"
        
        # Generate response
        response = llm_engine.generate_response(full_prompt)
        
        return PromptResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model generation failed: {str(e)}")