from pydantic import BaseModel
import json
import os
class Score(BaseModel):
    """
    Score model
    """
    attacker_score: int = 0
    defender_score: int = 0

class ScoreManager:
    def __init__(self):
        self.score_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "app/data/score.json")
        self.scores = self.load_scores()

    def load_scores(self):
        if os.path.exists(self.score_file):
            os.makedirs(os.path.dirname(self.score_file), exist_ok=True)
            initial_score = Score()
            self._save_scores(initial_score)
            return initial_score
        
        try:
            with open(self.score_file, "r") as f:
                data = json.load(f)
                return Score(**data)
        except FileNotFoundError:
            # If the file doesn't exist, create it with default values
            return Score()
        
    def _save_scores(self,score:Score):
        """
        Save the scores to the file
        """
        with open(self.score_file, "w") as f:
            json.dump(score.model_dump(), f)
            
    def increment_attacker_score(self):
        """
        Increment the attacker score
        """
        self.scores.attacker_score += 1
        self._save_scores(self.scores)
        
    def increment_defender_score(self):
        """
        Increment the defender score
        """
        self.scores.defender_score += 1
        self._save_scores(self.scores)
        
    def get_scores(self)->Score:
        """
        Get the current scores
        """
        return self.scores
    
    def reset_scores(self):
        """
        Reset the scores
        """
        self.scores = Score()
        self._save_scores(self.scores)
    
    def model_dump(self):
        """
        Convert the score to a dictionary
        """
        return {
            "attacker_score": self.attacker_score,
            "defender_score": self.defender_score
        }
            