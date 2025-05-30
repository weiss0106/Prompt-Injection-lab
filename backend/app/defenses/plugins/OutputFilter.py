from app.defenses.base import DefensePlugin, DefenseType

class OutputFilter(DefensePlugin):
    def __init__(self):
        super().__init__()
        self.name = "OutputFilter"
        self.description = "Custom output filtering defense"
        self.defense_type = DefenseType.OUTPUT_FILTERING
        self.config = {
            "sensitive_patterns": ["secret", "key", "password","FINAL_VICTORY"]
        }

    def process_prompt(self, prompt: str) -> str:
        return prompt

    def validate_prompt(self, prompt: str) -> bool:
        return True

    def process_output(self, output: str) -> str:
        if not self.is_active:
            print("DEBUG: OutputFilter is not active")
            return output
            
        for pattern in self.config["sensitive_patterns"]:
            output = output.replace(pattern, "[REDACTED]")
        return output