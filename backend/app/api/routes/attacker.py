from app.api.routes.llmapi import PromptRequest
from fastapi import APIRouter,Depends,HTTPException
from typing import List,Dict,Any
from app.api.routes.llmapi import PromptRequest
from app.challenges.manager import ChallengeManager

router = APIRouter(prefix="/attacker",tags=["attacker"])
challenge_manager = ChallengeManager()
challenge_manager.load_challenges()

@router.get("/")
async def get_all_challenges():
    """
    Get all challenges
    """
    return challenge_manager.get_all_challenges()

@router.get("/{challenge_id}")
async def get_challenge(challenge_id:str):
    """
    Get a challenge by id
    """
    challenge = challenge_manager.get_challenge(challenge_id)
    if not challenge:
        raise HTTPException(status_code=404,detail="Challenge not found")
    return challenge.get_challenge_info()

@router.post("/{challenge_id}/process")
async def process_challenge(challenge_id:str,request:PromptRequest):
    """
    Process a challenge
    """
    challenge = challenge_manager.get_challenge(challenge_id)
    if not challenge:
        raise HTTPException(status_code=404,detail="Challenge not found")
    
    try:
        # 使用请求中的prompt参数
        result = await challenge.process_prompt(request.prompt)
        
        # Record result and update score
        #TODO
        
        return {
            "response":result.response,
            "completed":result.completed
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/score")
async def get_attacker_score():
    """
    Get attacker score
    """
    #TODO
    return {
        "score":0,
        "total_challenges":0,
        "completed_challenges":0
    }
