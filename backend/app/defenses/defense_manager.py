import json
import os
import importlib.util
import sys
from typing import Dict, Any, List, Optional
from app.defenses.base import DefensePlugin


class DefenseManager:
    def __init__(self):
        self.plugins_dir = "app/defenses/plugins"
        self.plugins: Dict[str, DefensePlugin] = {}
        self.plugins_state_file = "app/defenses/plugins/plugins_state.json"
        self._ensure_plugins_directory()
        self._load_plugins_state()

    def _ensure_plugins_directory(self) -> None:
        """Ensure the plugins directory exists"""
        if not os.path.exists(self.plugins_dir):
            os.makedirs(self.plugins_dir)

    def _validate_plugin(self, code: str) -> bool:
        """Validate the plugin"""
        print("DEBUG:", code)
        try:
            if "class" not in code or "DefensePlugin" not in code:
                return False
            if "process_prompt" not in code or "validate_prompt" not in code:
                return False
            return True
        except Exception:
            return False

    def _load_plugins(self, plugin_name: str) -> None:
        """Load all plugins from the plugins directory"""
        try:
            file_path = os.path.join(self.plugins_dir, f"{plugin_name}.py")
            if not os.path.exists(file_path):
                return None

            spec = importlib.util.spec_from_file_location(plugin_name, file_path)
            if spec is None or spec.loader is None:
                return None

            module = importlib.util.module_from_spec(spec)
            sys.modules[plugin_name] = module
            spec.loader.exec_module(module)

            for attr_name in dir(module):
                attr = getattr(module, attr_name)
                if (
                    isinstance(attr, type)
                    and issubclass(attr, DefensePlugin)
                    and attr != DefensePlugin
                ):
                    instance = attr()
                    #originally set the plugin to inactive
                    instance.is_active=False
                    return instance
            return None
        except Exception as e:
            return e

    def _save_plugin(self, plugin_name: str, code: str) -> None:
        """Save the plugin code to the plugins directory"""
        try:
            file_path = os.path.join(self.plugins_dir, f"{plugin_name}.py")
            with open(file_path, "w") as f:
                f.write(code)
            return True
        except Exception:
            return False

    def _save_plugins_state(self) -> None:
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(self.plugins_state_file), exist_ok=True)

            state = {
                name: {
                    "is_active": plugin.is_active,
                    "description": plugin.description,
                }
                for name, plugin in self.plugins.items()
            }
            print(f"DEBUG: Saving plugins state to {self.plugins_state_file}")
            with open(self.plugins_state_file, "w") as f:
                json.dump(state, f)
        except Exception as e:
            print(f"Error saving plugins state: {e}")

    async def upload_plugins(self, plugin_name: str, code: str) -> None:
        """Upload all plugins to the database"""
        # print(f"DEBUG: Uploading plugin {plugin_name}")
        if not self._validate_plugin(code):
            print("DEBUG: Invalid plugin")
            return False

        if not self._save_plugin(plugin_name, code):
            # print("DEBUG: Failed to save plugin")
            return False

        plugin = self._load_plugins(plugin_name)
        if plugin is None:
            # print("DEBUG: Failed to load plugin")
            return False

        plugin.is_active=False
        self.plugins[plugin_name] = plugin
        print("DEBUG: Plugin uploaded successfully")
        self._save_plugins_state()
        return True

    def _load_plugins_state(self) -> None:
        """Load the plugins state from the plugins state file"""
        if not os.path.exists(self.plugins_state_file):
            return
        with open(self.plugins_state_file, "r") as f:
            state = json.load(f)
        for name, info in state.items():
            #if the plugin is already loaded, update the state
            if name in self.plugins:
                self.plugins[name].is_active = info["is_active"]
                self.plugins[name].description = info["description"]
            else:
                #if the plugin is not loaded, load it
                plugin = self._load_plugins(name)
                if plugin:
                    plugin.is_active = info["is_active"]
                    plugin.description = info["description"]
                    self.plugins[name] = plugin
                    print(f"DEBUG: Loaded plugin {name} with state {plugin.is_active}") 

    def get_plugin(self, plugin_name: str) -> Optional[DefensePlugin]:
        """Get a plugin by name"""
        return self.plugins.get(plugin_name)

    def get_all_plugins(self) -> List[Dict[str, Any]]:
        """Get all plugins"""
        return [
            {
                "name": plugin_name,
                "description": plugin.description,
                "info": plugin.get_info(),
            }
            for plugin_name, plugin in self.plugins.items()
        ]

    def toggle_plugin(self, plugin_name: str) -> bool:
        """Toggle a plugin"""
        print(f"DEBUG: Toggling plugin {plugin_name}")
        if plugin_name not in self.plugins:
            print(f"DEBUG: Plugin {plugin_name} not found")
            return False

        # Simply toggle the current plugin status
        self.plugins[plugin_name].is_active = not self.plugins[plugin_name].is_active
        self._save_plugins_state()
        #self._load_plugins_state()
        print(f"DEBUG: Plugin {plugin_name} toggled to {self.plugins[plugin_name].is_active}")
        return True

    def delete_plugin(self, plugin_name: str) -> bool:
        """Delete a plugin"""
        try:
            if plugin_name in self.plugins:
                del self.plugins[plugin_name]
            file_path = os.path.join(self.plugins_dir, f"{plugin_name}.py")
            if os.path.exists(file_path):
                os.remove(file_path)
            self._save_plugins_state()
            return True
        except Exception:
            return False

    def process_prompt(self, prompt: str) -> str:
        """Process the prompt with all active defenses"""
        self._load_plugins_state()
        processed_prompt = prompt
        for plugin in self.plugins.values():
            print(f"DEBUG: Plugin {plugin.name} is active: {plugin.is_active}")
            if plugin.is_active:
                processed_prompt = plugin.process_prompt(processed_prompt)
        return processed_prompt

    def process_output(self, output: str) -> str:
        """Process the output with all active defenses"""
        self._load_plugins_state()
        processed_output = output
        for plugin in self.plugins.values():
            if plugin.is_active:
                processed_output = plugin.process_output(processed_output)
                #print(f"DEBUG: Processed output: {processed_output}")
        return processed_output

    def validate_result(self, prompt: str) -> bool:
        """Validate the result with all active defenses"""
        self._load_plugins_state()
        for plugin in self.plugins.values():
            if plugin.is_active and not plugin.validate_result(prompt):
                return False
        return True
