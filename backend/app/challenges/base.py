from enum import Enum
from typing import List, Optional, Dict, Any, Union, Callable
from pydantic import BaseModel
from fastapi import HTTPException
import abc


class ChallengeType(Enum):
    """
    Challenge Type
    """

    DIRECT = "direct_injection"
    INDIRECT = "indirect_injection"


class DefenseType(Enum):
    """
    Defense Type
    """

    NONE = "none"
    INPUT_VALIDATION = "input_validation"
    OUTPUT_FILTERING = "output_filtering"
    CONTEXT_AWARE = "context_aware"
    PROMPT_STRENGTHENING = "prompt_strengthening"
    SANDBOX_EXECUTION = "sandbox_execution"


class Challenge(abc.ABC):
    """
    Challenge Base Class
    """

    def __init__(
        self,
        id: str,
        title: str,
        description: str,
        type: ChallengeType,
        level: int,
        defense_type: List[DefenseType] = None,
        secret_key: str = None,
    ):
        self.id = id
        self.title = title
        self.type = type
        self.level = level
        self.defense_type = defense_type
        self.description = description
        self.secret_key = secret_key
    @property
    def secret_key(self) -> str:
        """
        Secret Key
        """
        return self.secret_key
    
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
    
    
    
    
    
