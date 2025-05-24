from app.api.routes.llmapi import PromptRequest
from fastapi import APIRouter, File,HTTPException, UploadFile
from app.challenges.challenge_manager import ChallengeManager
from app.models.score import ScoreManager

router = APIRouter(prefix="/attacker",tags=["attacker"])
challenge_manager = ChallengeManager()
challenge_manager.load_challenges()
score_manager = ScoreManager()

@router.get("/")
async def get_all_challenges():
    """
    Get all challenges
    """
    return challenge_manager.get_all_challenges()

@router.get("/score")
async def get_attacker_score():
    """
    Get attacker score
    """
    scores = score_manager.get_scores()
    return scores.model_dump()

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
    
    result = await challenge.process_prompt(request.prompt)
    
    # Record result and update score
    # if result.completed:
    #     score_manager.increment_attacker_score()
    #     return {"message":"Challenge completed successfully!","score":score_manager.get_scores()}
    # # else:
    #     score_manager.increment_defender_score()only when the defenses are active, the defender score will be incremented
    
    return {
        "response":result.response,
        #"completed":result.completed
    }  

@router.post("/{challenge_id}/validate_key")
async def validate_key(challenge_id:str,key:str):
    """
    Validate a key for a challenge
    """
    challenge = challenge_manager.get_challenge(challenge_id)
    if not challenge:
        raise HTTPException(status_code=404,detail="Challenge not found")
    if challenge.validate_key(key):
        score_manager.increment_attacker_score()
        return {"message":"Key validated successfully!","score":score_manager.get_scores()}
    else:
        raise HTTPException(status_code=401,detail="Invalid key")

@router.post("/get_progress")
async def get_attacker_progress():
    """
    Get attacker progress of all challenges
    """
    return challenge_manager.check_all_challenges()

@router.post("/{challenge_id}/upload")
async def upload_file(challenge_id:str,file:UploadFile = File(...)):
    """
    Upload a file for indirect challenge
    """
    challenge = challenge_manager.get_challenge(challenge_id)
    if not challenge:
        raise HTTPException(status_code=404,detail="Challenge not found")
    
    try:
        result = await challenge.upload_file(file)
        return {"message": result}
    except NotImplementedError:
        raise HTTPException(status_code=400,detail="This challenge does not support file upload")
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"File upload failed: {str(e)}")