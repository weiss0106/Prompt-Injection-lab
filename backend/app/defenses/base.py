from abc import ABC,abstractmethod
from enum import Enum
from typing import Dict,Any,Optional
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
    
class DefensePlugin():
    """
    Base class for defense plugins
    """
    def __init__(self):
        self.is_active:bool = False
        self.name:str = "Base Defense"
        self.description:str = "Base class for defense plugins"
        self.config: Dict[str,Any] = {}
        self.defense_type: DefenseType = None
        """
        Process the prompt
        """
        pass
    
    @abstractmethod
    def enable(self) -> None:
        """
        Enable the defense
        """
        self.is_active = True
    
    def disable(self) -> None:
        """
        Disable the defense
        """
        self.is_active = False
    
    def is_active(self) -> bool:
        """
        Check if the defense is active
        """
        return self.is_active
    
    def get_info(self) -> Dict[str,Any]:
        """
        Get the info
        """
        return {
            "name":self.name,
            "description":self.description,
            "is_active":self.is_active,
            #"defense_type":self.defense_type.value
        }
    
    def reset(self)-> None:
        """
        Reset the defense
        """
        self.is_active = False
        self.config = {}

    @abstractmethod
    def validate_prompt(self,prompt:str)->bool:
        """
        Validate the prompt
        """
        pass
    @abstractmethod
    def process_output(self,output:str)->str:
        """
        Process the output
        """
        pass
    
    @abstractmethod
    def process_prompt(self,output:str)->str:
        """
        Process the prompt
        """
        pass
    
    