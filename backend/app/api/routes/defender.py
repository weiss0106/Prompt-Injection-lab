from fastapi import APIRouter,HTTPException,Depends,UploadFile,File
from app.defenses.defense_manager import DefenseManager
from app.defenses.base import DefensePlugin
from typing import List,Dict,Any
import os

from app.models.score import ScoreManager

router = APIRouter(prefix="/defender",tags=["Defender"])
defense_manager = DefenseManager()
score_manager = ScoreManager()

@router.post("/defenses/upload")
async def upload_defense(
    file:UploadFile = File(...),
    plugin_name:str = None
):
    """
    Upload a defense plugin
    Args:
        file: The file to upload
        plugin_name: The name of the plugin
        
    Returns:
        A message indicating the success of the upload
    """
    try:
        content = await file.read()
        code = content.decode()
        #Upload the plugin to the database
        if plugin_name is None:
            plugin_name = file.filename.split(".")[0]
        if await defense_manager.upload_plugins(plugin_name,code):
            return {"message":"Plugin uploaded successfully","plugin_name":plugin_name}
        else:
            raise HTTPException(status_code=400,detail="Invalid plugin format")
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"Upload failed:str{e}")
    
@router.get("/defenses")
async def get_defenses():
    """Get all defenses"""
    return defense_manager.get_all_plugins()

@router.post("/defenses/toggle")
async def toggle_defense(plugin_name:str):
    """Toggle a defense"""
    if defense_manager.toggle_plugin(plugin_name):
        return{
            "message":"Defense toggled successfully",
            #"score":score_manager.get_scores(plugin_name)
        }
    raise HTTPException(
        status_code=404,
        detail=f"Defense plugin not found"
    )

@router.delete("/defenses/{plugin_name}")
async def delete_defense(plugin_name:str):
    """Delete a defense"""
    if defense_manager.delete_plugin(plugin_name):
        return {"message":"Defense deleted successfully"}
    raise HTTPException(
        status_code=404,
        detail="Defense plugin not found"
    )
    
@router.get("/defenses/{plugin_name}")
async def get_defense(plugin_name:str):
    """Get a defense"""
    defense = defense_manager.get_plugin(plugin_name)
    if defense:
        return {
            "id":plugin_name,
            "info":defense.get_info()
        }
    raise HTTPException(
        status_code=404,
        detail="Defense plugin not found"
    )
    
@router.get("/defenses/{plugin_name}/code")
async def get_defense_code(plugin_name:str):
    """Get the source code of a defense plugin"""
    defense = defense_manager.get_plugin(plugin_name)
    if not defense:
        raise HTTPException(
            status_code=404,
            detail="Defense plugin not found"
        )
    
    # 使用绝对路径
    current_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    plugins_dir = os.path.join(current_dir, "defenses", "plugins")
    file_path = os.path.join(plugins_dir, f"{plugin_name}.py")
    
    print(f"Looking for file at: {file_path}")
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail=f"Plugin file not found at {file_path}"
        )
    
    try:
        with open(file_path, "r") as f:
            code = f.read()
        return {"code": code}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to read plugin code: {str(e)}"
        )
    
