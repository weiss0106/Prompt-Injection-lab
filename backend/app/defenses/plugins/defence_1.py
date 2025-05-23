from app.defenses.base import DefensePlugin

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
        self.is_active = False
    
    def process_prompt(self, prompt: str) -> str:
        """
        Process the prompt
        Args:
            prompt: The prompt to process
        Returns:
            The processed prompt
        """
        if not self.is_active:
            return prompt
            
        # Add your preprocessing logic here
        for keyword in self.config["blocked_keywords"]:
            if keyword in prompt.lower():
                prompt = prompt.replace(keyword, "[REDACTED]")
        return prompt
    
    def validate_prompt(self, prompt: str) -> bool:
        """
        Validate the prompt
        Args:
            prompt: The prompt to validate
        Returns:
            True if the prompt is valid, False otherwise
        """
        if not self.is_active:
            return True
            
        # Add your validation logic here
        for keyword in self.config["blocked_keywords"]:
            if keyword in prompt.lower():
                return False
        return True
        
    def set_config(self, config):
        """
        Set the config
        Args:
            config: The config to set
        """
        self.config = config