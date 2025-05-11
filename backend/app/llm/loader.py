#llm model loader
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
import os

# Cache directory for models
os.makedirs("model_cache", exist_ok=True)

class LLMEngine:
    def __init__(self, model_name ="meta-llama/llama-2-7b-chat-hf"):
        self.model_name = model_name
        self.tokenizer = None
        self.model = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
    
    def load_model(self):
        """
        Load the model and tokenizer.
        Returns:
            bool: True if the model is loaded successfully, False otherwise.
        """
        print(f"Loading model {self.model_name} on {self.device}...")
        # Load the tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name, cache_dir="model_cache")
        
        # Load the model
        self.model = AutoModelForCausalLM.from_pretrained(self.model_name,torch_dtype = torch.float16 if self.device == "cuda" else torch.float32, cache_dir="model_cache").to(self.device)
        
        print("Model loaded successfully.")
        return True
    
    def generate_response(self,prompt,max_length=512):
        """ 
        Generate model response and return

        Args:
            prompt (str): The input prompt for the model.
            max_length (int): The maximum length of the generated response.
        Returns:
            str: The generated response from the model.
        """
        if not self.model or not self.tokenizer:
            self.load_model()

        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)
        outputs = self.model.generate(**inputs, max_length=max_length,temperature=0.7,top_p=0.9, do_sample=True)
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        return response[len(prompt):]  # Return only the generated part, excluding the prompt
    
