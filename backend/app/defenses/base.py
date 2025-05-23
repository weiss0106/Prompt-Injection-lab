from abc import ABC,abstractmethod
from typing import Dict,Any,Optional

class DefensePlugin():
    """
    Base class for defense plugins
    """
    def __init__(self):
        self.is_active:bool = False
        self.name:str = "Base Defense"
        self.description:str = "Base class for defense plugins"
        self.config: Dict[str,Any] = {}
    
    @abstractmethod
    def process_prompt(self,prompt:str) -> str:
        """
        Process the prompt
        """
        pass
    
    @abstractmethod
    def set_config(self,config:Dict[str,Any])->None:
        """
        Set the config
        Args:
            config: Dict[str,Any]
        """
        self.config = config
    
    def get_config(self)->Dict[str,Any]:
        """
        Get the config
        """
        return self.config
    
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
            "config":self.config
        }
    
    def reset(self)-> None:
        """
        Reset the defense
        """
        self.is_active = False
        self.config = {}
