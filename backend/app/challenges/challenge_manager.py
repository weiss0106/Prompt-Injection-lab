from typing import Dict,Any,List,Optional
from .base import Challenge

class ChallengeManager:
    """
    Challenge Manager
    """
    _instance = None
    _challenges:Dict[str,Challenge] = {}

    def __new__(cls):
        """
        Create a singleton instance of the challenge manager
        """
        if cls._instance is None:
            cls._instance = super(ChallengeManager,cls).__new__(cls)
        return cls._instance
        
    def register_challenge(self,challenge:Challenge):
        """
        Register a challenge
        """
        self._challenges[challenge.challenge_id] = challenge
        
    def get_challenge(self,challenge_id:str) -> Optional[Challenge]:
        """
        Get a challenge by id
        """
        return self._challenges.get(challenge_id)
    
    def get_all_challenges(self) -> List[Dict[str,Any]]:
        """
        Get all challenges
        """
        return [challenge.get_challenge_info() for challenge in self._challenges.values()]
    
    def load_challenges(self) -> None:
        """
        Load all challenges from the challenges directory
        """
        from .challenge1 import Challenge1
        from .challenge2 import Challenge2
        
        self.register_challenge(Challenge1())
        self.register_challenge(Challenge2())
        
