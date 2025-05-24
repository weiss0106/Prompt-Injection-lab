import { Box, Typography, IconButton, TextField, Button, CircularProgress, Divider, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Switch, Menu, MenuItem, List, ListItem, ListItemText, ListItemSecondaryAction, Radio, FormControlLabel, RadioGroup } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState, useEffect } from 'react';

export default function DefencePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [defaultTemplate] = useState(`from app.defenses.base import DefensePlugin
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
        return output`);
            

  // 新增状态
  const [plugins, setPlugins] = useState([]);  // 插件列表
  const [selectedPlugin, setSelectedPlugin] = useState(null);  // 当前选中的插件
  const [isUploading, setIsUploading] = useState(false);  // 上传中状态
  const [isDeploying, setIsDeploying] = useState(false);  // 部署中状态
  const [isDeleting, setIsDeleting] = useState(false);  // 删除中状态
  const [pluginToDelete, setPluginToDelete] = useState(null);  // 要删除的插件
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);  // 删除确认对话框开关
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar开关
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Snackbar消息
  const [snackbarSeverity, setSnackbarSeverity] = useState('info'); // Snackbar类型
  const [deployDialogOpen, setDeployDialogOpen] = useState(false); // 部署确认对话框开关
  const [pluginToActivate, setPluginToActivate] = useState(null); // 要激活的插件
  const [menuAnchorEl, setMenuAnchorEl] = useState(null); // 菜单锚点
  const [activePluginForMenu, setActivePluginForMenu] = useState(null); // 当前菜单对应的插件
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // 是否有未保存的更改
  const [originalCode, setOriginalCode] = useState(''); // 原始代码，用于检测更改
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false); // 确认对话框开关
  const [pendingAction, setPendingAction] = useState(null); // 等待确认的操作

  // 获取所有插件
  const fetchPlugins = async () => {
    try {
      const response = await fetch('http://localhost:8001/defender/defenses');
      if (response.ok) {
        const data = await response.json();
        setPlugins(data);
        
        // 只在首次加载且没有选中插件时，自动选择第一个
        if (data.length > 0 && !selectedPlugin && document.readyState === 'complete' && !hasUnsavedChanges) {
          setSelectedPlugin(data[0].name);
        }
        
        console.log("Plugins fetched:", data); // 添加日志以便调试
      } else {
        console.error('Failed to fetch plugins:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching plugins:', error);
    }
  };

  // 组件加载时获取插件列表
  useEffect(() => {
    fetchPlugins();
  }, []);

  // 当选择插件时，加载其代码
  useEffect(() => {
    if (selectedPlugin && plugins.length > 0) {
      // 检查选中的插件是否存在于列表中
      const pluginExists = plugins.some(p => p.name === selectedPlugin);
      if (pluginExists) {
        fetchPluginCode(selectedPlugin);
      } else {
        // 如果选中的插件不存在于列表中，清除选择
        setSelectedPlugin(null);
      }
    }
  }, [selectedPlugin]);

  // 获取插件代码
  const fetchPluginCode = async (pluginName) => {
    if (!pluginName) {
      console.error('fetchPluginCode called with empty pluginName');
      return;
    }
    
    console.log(`Fetching code for plugin: ${pluginName}`);
    
    try {
      // 从插件目录中读取文件内容
      const encodedName = encodeURIComponent(pluginName.trim());
      const response = await fetch(`http://localhost:8001/defender/defenses/${encodedName}`);
      if (response.ok) {
        const data = await response.json();
        
        // 尝试获取插件代码
        try {
          const codeResponse = await fetch(`http://localhost:8001/defender/defenses/${encodedName}/code`);
          if (codeResponse.ok) {
            const codeData = await codeResponse.json();
            if (codeData.code) {
              console.log(`Code loaded for plugin: ${pluginName}, code length: ${codeData.code.length}`);
              setCode(codeData.code);
              setOriginalCode(codeData.code);
              setHasUnsavedChanges(false);
              
              // 更新插件列表中的信息
              setPlugins(prevPlugins => {
                const updatedPlugins = [...prevPlugins];
                const index = updatedPlugins.findIndex(p => p.name === pluginName);
                if (index !== -1) {
                  updatedPlugins[index] = { ...updatedPlugins[index], ...data };
                }
                return updatedPlugins;
              });
              
              return;
            }
          }
          throw new Error(`Failed to fetch code for plugin: ${pluginName}`);
        } catch (codeError) {
          console.error('Error fetching plugin code:', codeError);
          setCode('');
          setOriginalCode('');
          showSnackbar(`Error loading plugin code: ${codeError.message}`, 'error');
        }
      } else {
        throw new Error(`Failed to fetch plugin info: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching plugin:', error);
      setCode('');
      setOriginalCode('');
      showSnackbar(`Error loading plugin: ${error.message}`, 'error');
    }
  };

  // 显示Snackbar通知
  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // 关闭Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  // 上传插件
  const handleUpload = async () => {
    if (!code.trim()) return;
    
    setIsUploading(true);
    
    try {
      // 从代码中提取名称和描述
      const nameMatch = code.match(/self\.name\s*=\s*["']([^"']+)["']/);
      const descriptionMatch = code.match(/self\.description\s*=\s*["']([^"']+)["']/);
      
      // 获取新的插件名称
      const newPluginName = nameMatch ? nameMatch[1].trim() : 'custom_defense';
      const pluginDescription = descriptionMatch ? descriptionMatch[1].trim() : 'A custom defense plugin';
      
      // 检查是否是更新现有插件
      const isUpdate = selectedPlugin && plugins.some(plugin => plugin.name === selectedPlugin);
      
      // 检查是否发生了重命名
      const isRenaming = isUpdate && selectedPlugin !== newPluginName;

      if(!newPluginName) {
        showSnackbar('Please set a name for your plugin using self.name = "Your Plugin Name"', 'warning');
        setIsUploading(false);
        return;
      }
      
      // 如果是新插件或重命名，检查新名称是否已存在
      if ((!isUpdate || isRenaming) && plugins.some(plugin => plugin.name === newPluginName)) {
        showSnackbar(`Plugin name "${newPluginName}" already exists. Please choose another name.`, 'error');
        setIsUploading(false);
        return;
      }
      
      // 创建文件对象
      const file = new Blob([code], { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', file, 'defense_plugin.py');
      
      // 如果是重命名，先删除旧插件
      if (isRenaming) {
        try {
          const deleteResponse = await fetch(`http://localhost:8001/defender/defenses/${encodeURIComponent(selectedPlugin)}`, {
            method: 'DELETE',
          });
          
          if (!deleteResponse.ok) {
            throw new Error('Failed to delete old plugin during rename');
          }
        } catch (error) {
          showSnackbar(`Error during plugin rename: ${error.message}`, 'error');
          setIsUploading(false);
          return;
        }
      }
      
      // 上传插件（使用新名称）
      const url = `http://localhost:8001/defender/defenses/upload?plugin_name=${encodeURIComponent(newPluginName)}`;
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to upload plugin');
      }
      
      const result = await response.json();
      
      // 更新本地状态
      setPlugins(prevPlugins => {
        const updatedPlugins = [...prevPlugins];
        if (isRenaming) {
          // 如果是重命名，删除旧插件并添加新插件
          const oldIndex = updatedPlugins.findIndex(p => p.name === selectedPlugin);
          if (oldIndex !== -1) {
            updatedPlugins.splice(oldIndex, 1);
          }
          updatedPlugins.push({
            name: newPluginName,
            description: pluginDescription,
            info: {
              description: pluginDescription,
              is_active: false
            }
          });
        } else {
          // 更新或添加插件
          const index = updatedPlugins.findIndex(p => p.name === (isUpdate ? selectedPlugin : newPluginName));
          if (index !== -1) {
            // 更新现有插件
            updatedPlugins[index] = {
              ...updatedPlugins[index],
              name: newPluginName,
              description: pluginDescription,
              info: {
                ...updatedPlugins[index].info,
                description: pluginDescription
              }
            };
          } else {
            // 添加新插件
            updatedPlugins.push({
              name: newPluginName,
              description: pluginDescription,
              info: {
                description: pluginDescription,
                is_active: false
              }
            });
          }
        }
        return updatedPlugins;
      });

      // 更新选中的插件为新名称
      setSelectedPlugin(newPluginName);
      
      showSnackbar(
        isRenaming
          ? `Plugin renamed from "${selectedPlugin}" to "${newPluginName}" successfully!`
          : isUpdate
            ? `Plugin "${newPluginName}" updated successfully!`
            : `Plugin "${newPluginName}" uploaded successfully!`, 
        'success'
      );

      // 重置未保存状态
      setOriginalCode(code);
      setHasUnsavedChanges(false);
      
      // 从后端获取最新的插件信息，但保持当前选中的插件
      const currentSelected = newPluginName;  // 保存当前选中的插件名称
      await fetchPlugins();
      setSelectedPlugin(currentSelected);  // 重新设置选中的插件
      
    } catch (error) {
      console.error('Upload error:', error);
      showSnackbar(`Error: ${error.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // 打开部署确认对话框
  const handleOpenDeployDialog = () => {
    if (!selectedPlugin) {
      showSnackbar('Please select a plugin to deploy', 'info');
      return;
    }
    
    // 如果当前选中的插件已经是激活状态，直接执行取消激活操作
    if (getSelectedPluginStatus()) {
      executeDeployAction();
      return;
    }
    
    // 找出当前激活的插件
    const activePlugin = plugins.find(plugin => plugin.info?.is_active);
    
    // 如果有已激活的插件，显示确认对话框
    if (activePlugin) {
      setPluginToActivate(selectedPlugin);
      setDeployDialogOpen(true);
    } else {
      // 如果没有已激活的插件，直接执行激活操作
      executeDeployAction();
    }
  };

  // 关闭部署确认对话框
  const handleCloseDeployDialog = () => {
    setDeployDialogOpen(false);
    setPluginToActivate(null);
  };

  // 实际执行部署操作
  const executeDeployAction = async () => {
    setIsDeploying(true);
    
    try {
      // 使用查询参数方式传递plugin_name
      const response = await fetch(`http://localhost:8001/defender/defenses/toggle?plugin_name=${selectedPlugin}`, {
        method: 'POST',
      });
      
      console.log('Deploy response status:', response.status);
      
      if (!response.ok) {
        let errorMessage;
        try {
          const error = await response.json();
          errorMessage = error.detail || 'Failed to deploy plugin';
        } catch (e) {
          errorMessage = `HTTP error ${response.status}`;
        }
        throw new Error(errorMessage);
      }
      
      // 即使显示错误，后端可能已经成功处理了请求
      // 所以无论成功还是失败，都刷新插件列表
      await fetchPlugins();
      
      // 获取当前选中插件的状态
      const updatedPlugin = plugins.find(p => p.name === selectedPlugin);
      const isActive = updatedPlugin?.info?.is_active;
      
      // 只有在确认请求成功后才显示成功消息
      showSnackbar(
        isActive 
          ? `Plugin "${selectedPlugin}" activated successfully!` 
          : `Plugin "${selectedPlugin}" deactivated successfully!`, 
        'success'
      );
    } catch (error) {
      console.error('Deploy error:', error);
      
      // 尝试刷新插件列表，以防后端操作已成功但只是响应出错
      try {
        await fetchPlugins();
      } catch (refreshError) {
        console.error('Failed to refresh plugins after error:', refreshError);
      }
      
      showSnackbar(`Warning: Request failed but plugin may have been toggled. Error: ${error.message}`, 'warning');
    } finally {
      setIsDeploying(false);
    }
  };

  // 激活插件
  const handleDeploy = () => {
    handleOpenDeployDialog();
  };

  // 获取当前选中插件的状态
  const getSelectedPluginStatus = () => {
    const plugin = plugins.find(p => p.name === selectedPlugin);
    return plugin?.info?.is_active || false;
  };

  // 检查插件是否处于激活状态
  const isPluginActive = (pluginName) => {
    const plugin = plugins.find(p => p.name === pluginName);
    return plugin?.info?.is_active || false;
  };

  // 检查当前插件是否可编辑
  const isCurrentPluginEditable = () => {
    // 新建插件或未激活的已有插件可以编辑
    return !selectedPlugin || (selectedPlugin && !isPluginActive(selectedPlugin));
  };

  // 打开删除确认对话框
  const handleOpenDeleteDialog = (event, pluginName) => {
    event.stopPropagation(); // 阻止事件冒泡，避免触发选中插件
    setPluginToDelete(pluginName);
    setDeleteDialogOpen(true);
  };

  // 关闭删除确认对话框
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPluginToDelete(null);
  };

  // 统一处理切换到其他插件的逻辑
  const switchToPlugin = (pluginName, actionAfterSwitch = null, skipConfirmation = false) => {
    const switchAction = () => {
      setSelectedPlugin(pluginName);
      if (pluginName) {
        fetchPluginCode(pluginName);
      }
      if (actionAfterSwitch) {
        actionAfterSwitch();
      }
    };

    // 如果skipConfirmation为true，直接执行切换
    if (skipConfirmation) {
      switchAction();
      return;
    }

    // 检查是否有未保存的更改
    if ((hasUnsavedChanges && code.trim() !== originalCode.trim()) || 
        (!selectedPlugin && code.trim() === defaultTemplate.trim())) {
      setPendingAction({ action: switchAction, args: [] });
      setConfirmDialogOpen(true);
    } else {
      switchAction();
    }
  };

  // 处理选择插件
  const handleSelectPlugin = (pluginName) => {
    // Don't do anything if clicking the already selected plugin
    if (pluginName === selectedPlugin) {
      return;
    }
    switchToPlugin(pluginName);
  };

  // 处理删除插件
  const handleDeletePlugin = async () => {
    if (!pluginToDelete) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`http://localhost:8001/defender/defenses/${pluginToDelete}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete plugin');
      }
      
      // 如果删除的是当前选中的插件，清空选中状态
      if (selectedPlugin === pluginToDelete) {
        setSelectedPlugin(null);
      }
      
      // 首先直接从本地状态中移除该插件
      setPlugins(prevPlugins => prevPlugins.filter(plugin => plugin.name !== pluginToDelete));
      
      // 然后再从服务器获取最新的插件列表
      await fetchPlugins();
      
      showSnackbar(`Plugin "${pluginToDelete}" deleted successfully!`, 'success');
    } catch (error) {
      console.error('Delete error:', error);
      showSnackbar(`Error: ${error.message}`, 'error');
    } finally {
      setIsDeleting(false);
      handleCloseDeleteDialog();
    }
  };

  // 打开菜单
  const handleOpenMenu = (event, pluginName) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setActivePluginForMenu(pluginName);
  };

  // 关闭菜单
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setActivePluginForMenu(null);
  };

  // 处理开关切换
  const handleToggleSwitch = async (event, pluginName) => {
    event.stopPropagation();

    // 创建切换操作函数
    const executeToggle = async () => {
      setIsDeploying(true);
      try {
        // 先获取插件当前状态
        const currentPlugin = plugins.find(p => p.name === pluginName);
        const willBeActive = !currentPlugin?.info?.is_active;

        const response = await fetch(`http://localhost:8001/defender/defenses/toggle?plugin_name=${pluginName}`, {
          method: 'POST',
        });
        
        if (!response.ok) {
          let errorMessage;
          try {
            const error = await response.json();
            errorMessage = error.detail || 'Failed to toggle plugin';
          } catch (e) {
            errorMessage = `HTTP error ${response.status}`;
          }
          throw new Error(errorMessage);
        }

        // 先刷新插件列表以获取最新状态
        await fetchPlugins();
        
        // 如果切换的不是当前选中的插件，切换到该插件（跳过确认）
        if (selectedPlugin !== pluginName) {
          switchToPlugin(pluginName, null, true);
        }
        
        showSnackbar(
          willBeActive
            ? `Plugin "${pluginName}" activated successfully!` 
            : `Plugin "${pluginName}" deactivated successfully!`, 
          'success'
        );
      } catch (error) {
        console.error('Toggle error:', error);
        try {
          await fetchPlugins();
        } catch (refreshError) {
          console.error('Failed to refresh plugins after error:', refreshError);
        }
        
        showSnackbar(`Warning: Request failed but plugin may have been toggled. Error: ${error.message}`, 'warning');
      } finally {
        setIsDeploying(false);
      }
    };

    // 检查是否有未保存的更改
    if ((hasUnsavedChanges && code.trim() !== originalCode.trim()) || 
        (!selectedPlugin && code.trim() === defaultTemplate.trim())) {
      setPendingAction({ action: executeToggle, args: [] });
      setConfirmDialogOpen(true);
    } else {
      await executeToggle();
    }
  };

  // 创建新插件
  const handleCreateNew = () => {
    const createNewPlugin = () => {
      setSelectedPlugin(null);
      setCode(defaultTemplate);
      setOriginalCode('');  // 设置为空字符串，这样新建的模板会被视为未保存的更改
      setHasUnsavedChanges(true);  // 直接设置为未保存状态
    };

    // 检查是否有未保存的更改
    if (hasUnsavedChanges && code.trim() !== originalCode.trim()) {
      setPendingAction({ action: createNewPlugin, args: [] });
      setConfirmDialogOpen(true);
    } else {
      createNewPlugin();
    }
  };

  // 丢弃新插件
  const handleDiscardNew = () => {
    setCode('');
    setOriginalCode('');
    setHasUnsavedChanges(false);
  };

  return (
    <Box
    sx={{
        height: '100vh',
        width: '100vw',
        background: '#0A0D17',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
        position: 'relative',
        px: 2,
        py: 4,
        margin: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Snackbar通知 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Plugin
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {isPluginActive(pluginToDelete) 
              ? `Warning: "${pluginToDelete}" is currently active. Deleting it will automatically deactivate the plugin. Are you sure you want to continue?` 
              : `Are you sure you want to delete the plugin "${pluginToDelete}"?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeletePlugin} 
            color="error" 
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} /> : null}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 部署确认对话框 */}
      <Dialog
        open={deployDialogOpen}
        onClose={handleCloseDeployDialog}
        aria-labelledby="deploy-dialog-title"
        aria-describedby="deploy-dialog-description"
      >
        <DialogTitle id="deploy-dialog-title">
          Activate Plugin
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="deploy-dialog-description">
            Activating "{pluginToActivate}" will deactivate the currently active plugin. Do you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeployDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={() => {
              handleCloseDeployDialog();
              executeDeployAction();
            }} 
            color="primary" 
            variant="contained"
            sx={{
              background: 'linear-gradient(to right, #bb86fc, #a647f5)',
              '&:hover': {
                background: 'linear-gradient(to right, #c996ff, #b057ff)',
                boxShadow: '0 4px 8px rgba(187, 134, 252, 0.3)',
              },
            }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 未保存更改确认对话框 */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        aria-labelledby="unsaved-dialog-title"
        aria-describedby="unsaved-dialog-description"
      >
        <DialogTitle id="unsaved-dialog-title">
          Unsaved Changes
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="unsaved-dialog-description">
            Current plugin has unsaved changes. Continuing will lose these changes. Do you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={() => {
              setConfirmDialogOpen(false);
              if (pendingAction) {
                pendingAction.action(...pendingAction.args);
                setPendingAction(null);
              }
            }} 
            color="primary" 
            variant="contained"
            sx={{
              background: 'linear-gradient(to right, #bb86fc, #a647f5)',
              '&:hover': {
                background: 'linear-gradient(to right, #c996ff, #b057ff)',
                boxShadow: '0 4px 8px rgba(187, 134, 252, 0.3)',
              },
            }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 背景装饰圆形 */}
      <Box
        sx={{
          position: 'absolute',
          width: '20vw',
          height: '28vh',
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgb(112, 2, 163), transparent)',
          top: '5%',
          left: '5%',
          filter: 'blur(70px)',
          zIndex: 0,
          opacity: 0.4,
          minWidth: 100,
          minHeight: 100,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '26vw',
          height: '20vh',
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgb(69, 28, 157), transparent)',
          top: '5%',
          right: '10%',
          filter: 'blur(70px)',
          zIndex: 0,
          opacity: 0.3,
          minWidth: 120,
          minHeight: 120,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '30vw',
          height: '30vh',
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgb(56, 20, 132), transparent)',
          bottom: '5%',
          right: '30%',
          filter: 'blur(70px)',
          zIndex: 0,
          opacity: 0.5,
          minWidth: 80,
          minHeight: 80,
        }}
      />

      {/* 内容区域 */}
      <Box sx={{ width: '100%', maxWidth: '1200px', zIndex: 1, height: 'calc(100% - 20px)', display: 'flex', flexDirection: 'column' }}>
        {/* 返回按钮和标题 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton 
            onClick={() => navigate('/defencelist')} 
          sx={{
              color: 'white',
              mr: 1,
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
            Mid-layer plugin deployment
          </Typography>
        </Box>

        {/* 说明文本 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ color: '#eee' }}>
            You can add a Python middle layer plugin before the LLaMA call, or/and add a detection module after the model returns to filter user inputs or/and model outputs to prevent prompt injection attacks.
        </Typography>
      </Box>

        {/* 左右布局容器 */}
        <Box sx={{ display: 'flex', gap: 3, flex: 1, overflow: 'hidden' }}>
          {/* 左侧插件列表 */}
          <Box
            sx={{
              width: '350px',
              minWidth: '300px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: 'white' }}>
                Plugins
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCreateNew}
                sx={{
                  borderColor: 'rgba(187, 134, 252, 0.5)',
                  color: '#bb86fc',
                  '&:hover': {
                    borderColor: '#bb86fc',
                    backgroundColor: 'rgba(187, 134, 252, 0.08)',
                  },
                }}
              >
                New plugin
              </Button>
          </Box>
              
              {plugins.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '200px',
                borderRadius: '8px',
                border: '1px dashed rgba(255, 255, 255, 0.2)',
                p: 3
              }}>
                <Typography variant="body2" sx={{ color: '#aaa', fontStyle: 'italic', textAlign: 'center', mb: 2 }}>
                  No plugins available yet.
                </Typography>
                <Typography variant="body2" sx={{ color: '#aaa', textAlign: 'center', mb: 2 }}>
                  Create your first plugin to defend against prompt injection attacks.
                </Typography>
              </Box>
            ) : (
              <List sx={{ overflowY: 'auto', flex: 1 }}>
                    {plugins.map((plugin, index) => (
                      <Box key={plugin.name}>
                    <ListItem 
                          sx={{
                        py: 1.5,
                            backgroundColor: selectedPlugin === plugin.name 
                              ? 'rgba(187, 134, 252, 0.1)' 
                              : 'transparent',
                            '&:hover': {
                              backgroundColor: 'rgba(187, 134, 252, 0.05)',
                            },
                        borderRadius: '4px'
                      }}
                      onClick={() => handleSelectPlugin(plugin.name)}
                    >
                      <ListItemText
                        primary={
                                  <Typography variant="body1" sx={{ 
                                    color: 'white',
                                    fontWeight: selectedPlugin === plugin.name ? 500 : 400,
                                  }}>
                                    {plugin.name}
                                  </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Switch 
                          checked={plugin.info?.is_active || false}
                          onChange={(e) => handleToggleSwitch(e, plugin.name)}
                          disabled={isDeploying}
                              sx={{ 
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#bb86fc',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#bb86fc',
                            },
                          }}
                        />
                            <IconButton
                              size="small"
                          edge="end"
                          aria-label="more"
                          onClick={(e) => handleOpenMenu(e, plugin.name)}
                              sx={{ 
                                color: 'rgba(255, 255, 255, 0.5)',
                                '&:hover': {
                              color: '#fff',
                              backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                },
                              }}
                            >
                          <MoreVertIcon fontSize="small" />
                            </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                        {index < plugins.length - 1 && (
                          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                        )}
                      </Box>
                    ))}
              </List>
            )}
          </Box>

          {/* 右侧代码编辑器 */}
          <Box
            sx={{
              flex: 1,
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {(code || selectedPlugin) && (
              <Box sx={{ mb: 2 }}>
                {selectedPlugin && isPluginActive(selectedPlugin) && (
                  <Box 
                    sx={{ 
                      mb: 2, 
                      p: 1.5, 
                      backgroundColor: 'rgba(255, 153, 0, 0.15)', 
                      borderRadius: '4px',
                      borderLeft: '3px solid rgba(255, 153, 0, 0.7)',
                      display: 'flex', 
                      alignItems: 'center' 
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'rgba(255, 200, 100, 0.9)' }}>
                      This plugin is currently active. You need to disable it before making changes.
                    </Typography>
                </Box>
              )}
                {selectedPlugin ? (
                  // 已有插件显示只读标题
                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                    {`${selectedPlugin}.py`}
                  </Typography>
                ) : (
                  // 新建插件显示只读标题
                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                    {`Custom Defense.py`}
                  </Typography>
                )}
                
                {selectedPlugin ? (
                  // 已有插件显示只读描述
                  <Typography variant="body2" sx={{ color: '#aaa' }}>
                    {plugins.find(p => p.name === selectedPlugin)?.description || 'Python middleware plugin'}
                  </Typography>
                ) : (
                  // 新建插件显示只读描述
                  <Typography variant="body2" sx={{ color: '#aaa' }}>
                    {'A custom defense plugin'}
                  </Typography>
                )}
              </Box>
            )}
            
            {code || selectedPlugin ? (
              <>
                <TextField
                  multiline
                  fullWidth
                  variant="outlined"
                  value={code}
                  onChange={(e) => {
                    if (isCurrentPluginEditable()) {
                      setCode(e.target.value);
                      // Only mark as unsaved if there's an actual difference
                      const newCode = e.target.value;
                      const hasChanges = newCode.trim() !== originalCode.trim();
                      setHasUnsavedChanges(hasChanges);
                    }
                  }}
                  InputProps={{
                    style: {
                      fontFamily: 'monospace',
                      color: '#d4d4d4',
                      fontSize: '14px',
                      lineHeight: '1.5',
                    },
                    readOnly: !isCurrentPluginEditable(),
                  }}
                  rows={18}
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      backgroundColor: '#1e1e2d',
                      height: '100%',
                      opacity: isCurrentPluginEditable() ? 1 : 0.8,
                    },
                    '& .MuiInputBase-root': {
                      height: '100%',
                    },
                    '& .MuiInputBase-inputMultiline': {
                      height: '100%',
                      overflowY: 'auto',
                    },
                  }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
                  {selectedPlugin ? (
                    <>
                      <Button
                        variant="text"
                        onClick={(e) => handleOpenDeleteDialog(e, selectedPlugin)}
                        disabled={isDeleting || isPluginActive(selectedPlugin)}
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          },
                          '&.Mui-disabled': {
                            color: 'rgba(255, 255, 255, 0.3)',
                          },
                        }}
                      >
                        {isDeleting ? <CircularProgress size={24} color="inherit" /> : 'Delete'}
                      </Button>
                      {/* 始终显示Discard changes按钮，但根据状态禁用 */}
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setCode(originalCode);
                          setHasUnsavedChanges(false);
                        }}
                        disabled={!hasUnsavedChanges || isPluginActive(selectedPlugin)}
                        sx={{
                          borderColor: hasUnsavedChanges ? 'rgba(187, 134, 252, 0.5)' : 'rgba(255, 255, 255, 0.12)',
                          color: hasUnsavedChanges ? '#bb86fc' : 'rgba(255, 255, 255, 0.3)',
                          '&:hover': {
                            borderColor: '#bb86fc',
                            backgroundColor: 'rgba(187, 134, 252, 0.08)',
                          },
                          '&.Mui-disabled': {
                            borderColor: 'rgba(255, 255, 255, 0.12) !important',
                            color: 'rgba(255, 255, 255, 0.3) !important',
                          },
                        }}
                      >
                        Discard changes
                      </Button>
                    </>
                  ) : code && (
                    <Button
                      variant="text"
                      onClick={handleDiscardNew}
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        },
                      }}
                    >
                      Discard
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={isUploading || (selectedPlugin && isPluginActive(selectedPlugin))}
                    sx={{
                      background: 'linear-gradient(to right, #bb86fc, #a647f5)',
                      '&:hover': {
                        background: 'linear-gradient(to right, #c996ff, #b057ff)',
                        boxShadow: '0 4px 8px rgba(187, 134, 252, 0.3)',
                      },
                      '&.Mui-disabled': {
                        background: 'rgba(255, 255, 255, 0.12)',
                        color: 'rgba(255, 255, 255, 0.3)',
                      },
                    }}
                  >
                    {isUploading ? <CircularProgress size={24} color="inherit" /> : selectedPlugin ? 'Save' : 'Create'}
                  </Button>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  flex: 1
                }}
              >
                <Typography variant="h6" sx={{ color: 'white', mb: 2, textAlign: 'center' }}>
                  No Plugin Selected
                </Typography>
                <Typography variant="body1" sx={{ color: '#aaa', mb: 3, textAlign: 'center' }}>
                  Select a plugin in the list or click "New plugin" to create a new one
                </Typography>
            </Box>
            )}
          </Box>
        </Box>
        
        {/* 插件操作菜单 */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleCloseMenu}
          PaperProps={{
            sx: {
              backgroundColor: '#1e1e2d',
              color: 'white',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            }
          }}
        >
          <MenuItem 
            onClick={() => {
              handleOpenDeleteDialog(new Event('click'), activePluginForMenu);
              handleCloseMenu();
            }}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              }
            }}
          >
            <Typography variant="body2">Delete</Typography>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}