from app.defenses.base import DefensePlugin, DefenseType

class KeywordFilterDefense(DefensePlugin):
    """
    Keyword Filter Defense
    """
    def __init__(self):
        super().__init__()
        self.name = "KeywordFilter"
        self.description = "Filter out keywords in the prompt"
        self.defense_type = DefenseType.INPUT_VALIDATION
        self.config = {
            "blocked_keywords":["hack","system","key","secret"]
        }
        
    def process_prompt(self,prompt:str) -> str:
        if not self.is_active:
            print(f"DEBUG: KeywordFilter is not active")
            return prompt
        
        for keyword in self.config["blocked_keywords"]:
            prompt = prompt.replace(keyword,"[REDACTED]")
        print(f"DEBUG: Processed prompt: {prompt}")
        return prompt
    
    def validate_prompt(self,prompt:str)-> bool:
        if not self.is_active:
            return True
        
        for keyword in self.config["blocked_keywords"]:
            if keyword in prompt.lower():
                return False
        return True

    def process_output(self,output:str)->str:
        return output
