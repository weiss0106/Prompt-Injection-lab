from app.defenses.base import DefensePlugin
from app.defenses.base import DefenseType

class CustomDefensePlugin(DefensePlugin):
    """
    Custom Defense Plugin
    """
    def __init__(self):
        super().__init__()
        self.name = "Custom Defense"
        self.description = "A custom defense plugin"
        self.config = {
            "blocked_keywords": ["hack", "system", "prompt", "secret"]
        }
        self.defense_type = DefenseType.NONE  # Compulsory field
        self.is_active = False
    
    def process_prompt(self, prompt: str) -> str:
        """
        Process the prompt
        Args:
            prompt: The prompt to process
        Returns:
            The processed prompt
        """
        return prompt
    
    def validate_prompt(self, prompt: str) -> bool:
        """
        Validate the prompt
        Args:
            prompt: The prompt to validate
        Returns:
            True if the prompt is valid, False otherwise
        """
        return True
        
    def process_output(self, output: str) -> str:
        """
        Process the output
        Args:
            output: The output to process
        Returns:
            The processed output
        """
        return output