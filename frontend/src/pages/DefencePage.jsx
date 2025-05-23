import { Box, Typography, IconButton, TextField, Button, CircularProgress, Divider, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Radio, FormControlLabel, RadioGroup } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect } from 'react';

export default function DefencePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState(`from app.defenses.base import DefensePlugin

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
        self.config = config`);

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

  // 获取所有插件
  const fetchPlugins = async () => {
    try {
      const response = await fetch('http://localhost:8001/defender/defenses');
      if (response.ok) {
        const data = await response.json();
        setPlugins(data);
        
        // 找出当前激活的插件
        const activePlugin = data.find(plugin => plugin.info?.is_active);
        if (activePlugin) {
          setSelectedPlugin(activePlugin.name);
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
      // 找出当前插件中的最大编号
      let maxPluginNumber = 0;
      plugins.forEach(plugin => {
        // 假设插件名格式为 "defence_X" 或其它包含数字的格式
        const match = plugin.name.match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          maxPluginNumber = Math.max(maxPluginNumber, num);
        }
      });
      
      // 新插件编号为最大编号+1
      const pluginNumber = maxPluginNumber + 1;
      
      // 创建文件对象
      const file = new Blob([code], { type: 'text/plain' });
      const formData = new FormData();
      const fileName = `defence_${pluginNumber}.py`;
      formData.append('file', file, fileName);
      
      // 上传插件
      const response = await fetch('http://localhost:8001/defender/defenses/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to upload plugin');
      }
      
      const result = await response.json();
      showSnackbar(`Plugin "${result.plugin_name}" uploaded successfully!`, 'success');
      
      // 刷新插件列表
      fetchPlugins();
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

  // 打开删除确认对话框
  const handleOpenDeleteDialog = (event, pluginName) => {
    event.stopPropagation(); // 阻止事件冒泡，避免触发选中插件
    setPluginToDelete(pluginName);
    setDeleteDialogOpen(true);
  };

  // 检查插件是否处于激活状态
  const isPluginActive = (pluginName) => {
    const plugin = plugins.find(p => p.name === pluginName);
    return plugin?.info?.is_active || false;
  };

  // 关闭删除确认对话框
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPluginToDelete(null);
  };

  // 删除插件
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

  return (
    <Box
    sx={{
        minHeight: '100vh',
        width: '100vw',
        background: '#0A0D17',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
        position: 'relative',
        px: 2,
        py: 6,
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
      
      {/* 背景装饰圆形 */}
      <Box
        sx={{
          position: 'absolute',
          width: '20vw',
          height: '28vh',
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgb(112, 2, 163), transparent)',
          top: '10%',
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
          top: '10%',
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
          bottom: '10%',
          right: '30%',
          filter: 'blur(70px)',
          zIndex: 0,
          opacity: 0.5,
          minWidth: 80,
          minHeight: 80,
        }}
      />

      {/* 内容区域 */}
      <Box sx={{ width: '100%', maxWidth: '1400px', zIndex: 1 }}>
        {/* 返回按钮和标题 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
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
            Python Middle Layer Defence
          </Typography>
        </Box>

        {/* 说明文本 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ color: '#eee', mb: 2 }}>
            You can add a Python middle layer before the LLaMA call, and add a detection module after the model returns.
            This allows you to filter both user inputs and model outputs to prevent prompt injection attacks.
        </Typography>
          <Typography variant="body1" sx={{ color: '#eee' }}>
            Write your Python middleware code below. You can define functions for preprocessing prompts and
            filtering responses.
        </Typography>
      </Box>

        {/* 左右布局容器 */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* 左侧代码编辑器 */}
          <Box
            sx={{
              width: '900px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              p: 3,
            }}
          >
            <TextField
              multiline
              fullWidth
              variant="outlined"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              InputProps={{
                style: {
                  fontFamily: 'monospace',
                  color: '#d4d4d4',
                  fontSize: '14px',
                  lineHeight: '1.5',
                },
              }}
              rows={24}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: '#1e1e2d',
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleUpload}
                disabled={isUploading}
                sx={{
                  borderColor: 'rgba(187, 134, 252, 0.5)',
                  color: '#bb86fc',
                  '&:hover': {
                    borderColor: '#bb86fc',
                    backgroundColor: 'rgba(187, 134, 252, 0.08)',
                  },
                }}
              >
                {isUploading ? <CircularProgress size={24} color="inherit" /> : 'Upload'}
              </Button>
            </Box>
          </Box>

          {/* 右侧插件列表 */}
          <Box sx={{ flex: 1 }}>
            {/* 插件列表区域 */}
      <Box
        sx={{
          width: '100%',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                p: 3, 
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Available Plugins
              </Typography>
              
              {plugins.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#aaa', fontStyle: 'italic', mb: 3 }}>
                  No plugins available. Upload a plugin first.
                </Typography>
              ) : (
                <Box sx={{ mb: 3, maxHeight: '500px', overflowY: 'auto' }}>
                  <RadioGroup
                    value={selectedPlugin || ''}
                    onChange={(e) => setSelectedPlugin(e.target.value)}
                  >
                    {plugins.map((plugin, index) => (
                      <Box key={plugin.name}>
                        <Box 
                          sx={{
                            py: 2,
                            px: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
                            backgroundColor: selectedPlugin === plugin.name 
                              ? 'rgba(187, 134, 252, 0.1)' 
                              : 'transparent',
                            '&:hover': {
                              backgroundColor: 'rgba(187, 134, 252, 0.05)',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <FormControlLabel
                              value={plugin.name}
                              control={
                                <Radio
                                  sx={{
                                    color: '#bb86fc',
                                    '&.Mui-checked': {
                                      color: '#bb86fc',
                                    },
                                  }}
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="body1" sx={{ 
                                    color: 'white',
                                    fontWeight: selectedPlugin === plugin.name ? 500 : 400,
                                  }}>
                                    {plugin.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#aaa' }}>
                                    {plugin.description || 'Python middleware plugin'}
                                  </Typography>
                                </Box>
                              }
                              sx={{ 
                                margin: 0,
                                flex: 1
                              }}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                            <Box sx={{ 
                              px: 1.5, 
                              py: 0.5, 
                              borderRadius: 1, 
                              mr: 2,
                              backgroundColor: plugin.info?.is_active 
                                ? 'rgba(76, 175, 80, 0.2)' 
                                : 'rgba(158, 158, 158, 0.2)',
                              color: plugin.info?.is_active ? '#81c784' : '#bdbdbd',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                            }}>
                              {plugin.info?.is_active ? 'Active' : 'Inactive'}
                            </Box>
                            <IconButton
                              size="small"
                              aria-label="delete"
                              onClick={(e) => handleOpenDeleteDialog(e, plugin.name)}
                              sx={{ 
                                color: 'rgba(255, 255, 255, 0.5)',
                                '&:hover': {
                                  color: '#f44336',
                                  backgroundColor: 'rgba(244, 67, 54, 0.08)',
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        {index < plugins.length - 1 && (
                          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                        )}
                      </Box>
                    ))}
                  </RadioGroup>
                </Box>
              )}
              
              {/* 部署按钮 */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleDeploy}
                  disabled={isDeploying || !selectedPlugin}
                  sx={{
                    background: getSelectedPluginStatus()
                      ? 'linear-gradient(to right, #f44336, #e53935)'
                      : 'linear-gradient(to right, #bb86fc, #a647f5)',
                    '&:hover': {
                      background: getSelectedPluginStatus()
                        ? 'linear-gradient(to right, #ef5350, #e57373)'
                        : 'linear-gradient(to right, #c996ff, #b057ff)',
                      boxShadow: getSelectedPluginStatus()
                        ? '0 4px 8px rgba(244, 67, 54, 0.3)'
                        : '0 4px 8px rgba(187, 134, 252, 0.3)',
                    },
                    '&.Mui-disabled': {
                      background: 'rgba(255, 255, 255, 0.12)',
                      color: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  {isDeploying ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    getSelectedPluginStatus() ? 'Undeploy' : 'Deploy'
                  )}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}