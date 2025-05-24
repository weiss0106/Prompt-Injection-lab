from enum import Enum
from typing import List, Optional, Dict, Any, Union, Callable
from pydantic import BaseModel
from fastapi import HTTPException, UploadFile

import abc
from app.llm.loader import LLMEngine
from app.defenses.base import DefenseType

class ChallengeType(Enum):
    """
    Challenge Type
    """

    DIRECT = "direct_injection"
    INDIRECT = "indirect_injection"
    FINAL = "final_challenge"


# class DefenseType(Enum):
#     """
#     Defense Type
#     """

#     NONE = "none"
#     INPUT_VALIDATION = "input_validation"
#     OUTPUT_FILTERING = "output_filtering"
#     CONTEXT_AWARE = "context_aware"
#     PROMPT_STRENGTHENING = "prompt_strengthening"
#     SANDBOX_EXECUTION = "sandbox_execution"

class ChallengeResponse(BaseModel):
    """
    Challenge Response
    """
    response: str
    success: bool = True
    completed: bool = False
    secret_key: Optional[str] = None

class Challenge(abc.ABC):
    """
    Challenge Base Class
    """

    def __init__(
        self,
        challenge_id: str,
        name: str,
        description: str,
        challenge_type: ChallengeType,
        defense_type: List[DefenseType] = None,
        _key: str = None,
        difficulty: int = 1,
        completed: bool = False
    ):
        """
        Initialize the challenge

        Args:
            id (str): The id of the challenge
            title (str): The title of the challenge
            description (str): The description of the challenge
            type (ChallengeType): The type of the challenge
            level (int): The level of the challenge
            defense_type (List[DefenseType]): The defense type of the challenge
            secret_key (str): The secret key of the challenge
            difficulty (int): The difficulty of the challenge
        """
        self.challenge_id = challenge_id
        self.name = name
        self.challenge_type = challenge_type
        self.defense_type = defense_type
        self.description = description
        self._key = _key
        self.difficulty = difficulty
        self.llm_engine = LLMEngine()
        self.active_defenses = []
        self.completed = completed
    @property
    def secret_key(self) -> str:
        """
        Secret Key
        """
        return self._key
    
    @abc.abstractmethod
    async def process_prompt(self,prompt:str)->str:
        """
        Process Prompt
        
        Args:
            prompt (str): The prompt to process
            
        Returns:
            str: The processed prompt
        """
        pass
    
    async def upload_file(self,file:UploadFile)->str:
        """
        Upload a file (optional method)
        """
        raise NotImplementedError("This challenge does not support file upload")
    
    def is_completed(self)->bool:
        """
        Check if the challenge is completed
        """
        return self.completed

    def apply_defenses(self,prompt:str)->str:
        """
        Apply defenses to the prompt
        """
        processed_prompt = prompt
        for defense in self.active_defenses:
            processed_prompt = defense.apply(processed_prompt)
        return processed_prompt
    

    def get_challenge_info(self)->Dict[str,Any]:
        """
        Get the challenge info
        """
        return {
            "id":self.challenge_id,
            "name":self.name,
            "description":self.description,
            "type":self.challenge_type.value,
            #"defenses": [defense.value for defense in self.defense_type],
            "difficulty":self.difficulty
        }
    
    def generate_llm_response(self, system_instruction: str, user_prompt: str) -> str:
        """
        Generate a response from the LLM
        """
        full_prompt = f"{system_instruction}\nUser: {user_prompt}"
        return self.llm_engine.generate_response(full_prompt)
    
    def add_defense(self,defense:DefenseType):
        """
        Add a defense to the challenge
        """
        if defense not in self.active_defenses:
            self.active_defenses.append(defense)
        
    def remove_defense(self,defense:DefenseType):
        """
        Remove a defense from the challenge
        """
        self.active_defenses = [d for d in self.active_defenses if d != defense]

    # def handle_error(self,error:Exception)->str:
    #     """
    #     Handle an error
    #     """
    #     return ChallengeResponse(
    #         response=str(error),
    #         success=False,
    #         error=str(error)
    #     )
    
    def validate_key(self,key:str)->bool:
        """
        Validate the key
        """
        if key == self._key:
            self.completed = True
            return True
        return False
    
    