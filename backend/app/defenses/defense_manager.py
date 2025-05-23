import os
import importlib.util
import sys
from typing import Dict,Any,List,Optional
from app.defenses.base import DefensePlugin

class DefenseManager():
    def __init__(self):
        self.plugins_dir = "app/defenses/plugins"
        self.plugins: Dict[str,DefensePlugin] = {}
        self._ensure_plugins_directory()
    
    def _ensure_plugins_directory(self)->None:
        """Ensure the plugins directory exists"""
        if not os.path.exists(self.plugins_dir):
            os.makedirs(self.plugins_dir)
    
    def _validate_plugin(self,code:str)->bool:
        """Validate the plugin"""
        try:
            if "class" not in code or "DefensePlugin" not in code:
                return False
            if "process_prompt" not in code or "validate_prompt" not in code:
                return False
            return True
        except Exception:
            return False
        
    def _load_plugins(self,plugin_name:str)->None:
        """Load all plugins from the plugins directory"""
        try:
            file_path = os.path.join(self.plugins_dir, f"{plugin_name}.py")
            spec = importlib.util.spec_from_file_location(plugin_name,file_path)            
            if spec is None or spec.loader is None:
                return None
            
            module = importlib.util.module_from_spec(spec)
            sys.modules[plugin_name] = module
            spec.loader.exec_module(module)
            
            for attr_name in dir(module):
                attr = getattr(module,attr_name)
                if(isinstance(attr,type) and issubclass(attr,DefensePlugin) and attr != DefensePlugin):
                    return attr()
            return None
        except Exception:
            return None
    
    def _save_plugin(self,plugin_name:str,code:str)->None:
        """Save the plugin code to the plugins directory"""
        try:
            file_path = os.path.join(self.plugins_dir,f"{plugin_name}.py")
            with open(file_path,"w") as f:
                f.write(code)
            return True
        except Exception:
            return False
    
    async def upload_plugins(self,plugin_name:str,code:str)->None:
        """Upload all plugins to the database"""
        if not self._validate_plugin(code):
            return False
        
        if not self._save_plugin(plugin_name,code):
            return False
        
        plugin = self._load_plugins(plugin_name)
        if plugin is None:
            return False
        
        self.plugins[plugin_name] = plugin
        return True
    
    def get_plugin(self,plugin_name:str)->Optional[DefensePlugin]:
        """Get a plugin by name"""
        return self.plugins.get(plugin_name)
    
    def get_all_plugins(self) -> List[Dict[str,Any]]:
        """Get all plugins"""
        return[
            {
                "name":plugin_name,
                "description":plugin.description,
                "info":plugin.get_info()
            }
            for plugin_name,plugin in self.plugins.items()
        ]
    
    def toggle_plugin(self,plugin_name:str)->bool:
        """Toggle a plugin"""
        if plugin_name not in self.plugins:
            return False
        
        self.plugins[plugin_name].enabled = not self.plugins[plugin_name].enabled
        return True
    
    def delete_plugin(self,plugin_name:str)-> bool:
        """Delete a plugin"""
        try:
            if plugin_name not in self.plugins:
                del self.plugins[plugin_name]
            file_path = os.path.join(self.plugins_dir,f"{plugin_name}.py")
            if os.path.exists(file_path):
                os.remove(file_path)
            return True
        except Exception:
            return False
    
            