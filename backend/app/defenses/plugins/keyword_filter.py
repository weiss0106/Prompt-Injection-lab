from app.defenses.base import DefensePlugin

class KeywordFilterDefense(DefensePlugin):
    """
    Keyword Filter Defense
    """
    def __init__(self):
        super().__init__()
        self.name = "Keyword Filter"
        self.description = "Filter out keywords in the prompt"
        self.config = {
            "blocked_keywords":[]
        }
        
    def process_prompt(self,prompt:str) -> str:
        if not self.is_active:
            return prompt
        
        for keyword in self.config["blocked_keywords"]:
            prompt = prompt.replace(keyword,"[REDACTED]")
        return prompt
    
    def validate_result(self,prompt:str)-> bool:
        if not self.is_active:
            return True
        
        for keyword in self.config["blocked_keywords"]:
            if keyword in prompt.lower():
                return False
        return True
    
                    