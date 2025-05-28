#llm model loader
import os
import requests

# Cache directory for models
os.makedirs("model_cache", exist_ok=True)

class LLMEngine:
    _instance = None
    # _model = None
    # _tokenizer = None
    max_tokens=64
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(LLMEngine, cls).__new__(cls)
        return cls._instance
    
    def __init__(self, model_name="llama3.2:1b"):
        # Only initialize once
        if not hasattr(self, 'initialized'):
            self.model_name = model_name
            # self.tokenizer = None
            # self.model = None
            # self.device = "cuda" if torch.cuda.is_available() else "cpu"
            self.initialized = True
            # self.model_server_url = "http://localhost:8080/generate"
            self.ollama_api_url = f"http://{os.getenv('OLLAMA_HOST', 'localhost')}:11434/api/generate"
            
    def load_model(self):
        try:
            response = requests.get("http://localhost:11434/api/tags")
            if response.status_code == 200:
                models = response.json().get("models", [])
                models_list = [model.get("name") for model in models]
                if self.model_name not in models_list:
                    print(f"Warning: Model is not available in Ollama")
                    print(f"Available Models:{models_list}")
                    print(f"Try to use 'ollama pull {self.model_name}'")
                return True
            return False
        except Exception as e:
            print(f"Cannot connect to Ollama:{str(e)}")
            print("Please confirm the Ollama server is running")
            return False
        
    def generate_response(self, prompt):
        try:
            data={
                "model":self.model_name,
                "prompt": prompt,
                "stream": False,
                "options":{
                    "temperature":1.3,
                    "top_p":0.9,
                    "max_tokens":self.max_tokens
                }
            }
            response = requests.post(self.ollama_api_url,json=data)
            if response.status_code == 200:
                result = response.json()
                return result.get("response","")
            else:
                return f"Error:{response.status_code}-{response.text}"
        except Exception as e:
            return f"Connection error: {str(e)}"
            
    
