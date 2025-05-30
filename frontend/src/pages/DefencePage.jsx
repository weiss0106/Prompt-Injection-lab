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
            

  // new states
  const [plugins, setPlugins] = useState([]);  // plugin list
  const [selectedPlugin, setSelectedPlugin] = useState(null);  // currently selected plugin
  const [isUploading, setIsUploading] = useState(false);  // uploading status
  const [isDeploying, setIsDeploying] = useState(false);  // deploying status
  const [isDeleting, setIsDeleting] = useState(false);  // deleting status
  const [pluginToDelete, setPluginToDelete] = useState(null);  // plugin to delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);  // delete confirmation dialog switch
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar switch
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState('info'); // Snackbar type
  const [deployDialogOpen, setDeployDialogOpen] = useState(false); // deploy confirmation dialog switch
  const [pluginToActivate, setPluginToActivate] = useState(null); // plugin to activate
  const [menuAnchorEl, setMenuAnchorEl] = useState(null); // menu anchor point
  const [activePluginForMenu, setActivePluginForMenu] = useState(null); // plugin corresponding to current menu
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // whether there are unsaved changes
  const [originalCode, setOriginalCode] = useState(''); // original code, for detecting changes
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false); // confirm dialog switch
  const [pendingAction, setPendingAction] = useState(null); // pending action to confirm

  // get all plugins
  const fetchPlugins = async () => {
    try {
      const response = await fetch('http://localhost:8001/defender/defenses');
      if (response.ok) {
        const data = await response.json();
        setPlugins(data);
        
        // automatically select the first plugin only when loading for the first time and no plugin is selected
        if (data.length > 0 && !selectedPlugin && document.readyState === 'complete' && !hasUnsavedChanges) {
          setSelectedPlugin(data[0].name);
        }
        
        console.log("Plugins fetched:", data); // add log for debugging
      } else {
        console.error('Failed to fetch plugins:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching plugins:', error);
    }
  };

  // get plugin list when component loads
  useEffect(() => {
    fetchPlugins();
  }, []);

  // load plugin code when selecting a plugin
  useEffect(() => {
    if (selectedPlugin && plugins.length > 0) {
      // check if the selected plugin exists in the list
      const pluginExists = plugins.some(p => p.name === selectedPlugin);
      if (pluginExists) {
        fetchPluginCode(selectedPlugin);
      } else {
        // if the selected plugin does not exist in the list, clear the selection
        setSelectedPlugin(null);
      }
    }
  }, [selectedPlugin]);

  // get plugin code
  const fetchPluginCode = async (pluginName) => {
    if (!pluginName) {
      console.error('fetchPluginCode called with empty pluginName');
      return;
    }
    
    console.log(`Fetching code for plugin: ${pluginName}`);
    
    try {
      // read file content from plugin directory
      const encodedName = encodeURIComponent(pluginName.trim());
      const response = await fetch(`http://localhost:8001/defender/defenses/${encodedName}`);
      if (response.ok) {
        const data = await response.json();
        
        // try to get plugin code
        try {
          const codeResponse = await fetch(`http://localhost:8001/defender/defenses/${encodedName}/code`);
          if (codeResponse.ok) {
            const codeData = await codeResponse.json();
            if (codeData.code) {
              console.log(`Code loaded for plugin: ${pluginName}, code length: ${codeData.code.length}`);
              setCode(codeData.code);
              setOriginalCode(codeData.code);
              setHasUnsavedChanges(false);
              
              // update information in plugin list
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

  // display Snackbar notification
  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // close Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  // upload plugin
  const handleUpload = async () => {
    if (!code.trim()) return;
    
    setIsUploading(true);
    
    try {
      // extract name and description from code
      const nameMatch = code.match(/self\.name\s*=\s*["']([^"']+)["']/);
      const descriptionMatch = code.match(/self\.description\s*=\s*["']([^"']+)["']/);
      
      // get new plugin name
      const newPluginName = nameMatch ? nameMatch[1].trim() : 'custom_defense';
      const pluginDescription = descriptionMatch ? descriptionMatch[1].trim() : 'A custom defense plugin';
      
      // check if it is updating an existing plugin
      const isUpdate = selectedPlugin && plugins.some(plugin => plugin.name === selectedPlugin);
      
      // check if it is renaming
      const isRenaming = isUpdate && selectedPlugin !== newPluginName;

      if(!newPluginName) {
        showSnackbar('Please set a name for your plugin using self.name = "Your Plugin Name"', 'warning');
        setIsUploading(false);
        return;
      }
      
      // if it is a new plugin or renaming, check if the new name already exists
      if ((!isUpdate || isRenaming) && plugins.some(plugin => plugin.name === newPluginName)) {
        showSnackbar(`Plugin name "${newPluginName}" already exists. Please choose another name.`, 'error');
        setIsUploading(false);
        return;
      }
      
      // create file object
      const file = new Blob([code], { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', file, 'defense_plugin.py');
      
      // if it is renaming, delete the old plugin first
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
      
      // upload plugin (using new name)
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
      
      // update local state
      setPlugins(prevPlugins => {
        const updatedPlugins = [...prevPlugins];
        if (isRenaming) {
          // if it is renaming, delete the old plugin and add the new plugin
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
          // update or add plugin
          const index = updatedPlugins.findIndex(p => p.name === (isUpdate ? selectedPlugin : newPluginName));
          if (index !== -1) {
            // update existing plugin
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
            // add new plugin
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

      // update the selected plugin to the new name
      setSelectedPlugin(newPluginName);
      
      showSnackbar(
        isRenaming
          ? `Plugin renamed from "${selectedPlugin}" to "${newPluginName}" successfully!`
          : isUpdate
            ? `Plugin "${newPluginName}" updated successfully!`
            : `Plugin "${newPluginName}" uploaded successfully!`, 
        'success'
      );

      // reset unsaved state
      setOriginalCode(code);
      setHasUnsavedChanges(false);
      
      // get the latest plugin information from the backend, but keep the currently selected plugin
      const currentSelected = newPluginName;  // save the name of the currently selected plugin
      await fetchPlugins();
      setSelectedPlugin(currentSelected);  // reset the selected plugin
      
    } catch (error) {
      console.error('Upload error:', error);
      showSnackbar(`Error: ${error.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // open deploy confirmation dialog
  const handleOpenDeployDialog = () => {
    if (!selectedPlugin) {
      showSnackbar('Please select a plugin to deploy', 'info');
      return;
    }
    
    // if the currently selected plugin is already activated, execute the deactivate operation directly
    if (getSelectedPluginStatus()) {
      executeDeployAction();
      return;
    }
    
    // find the currently activated plugin
    const activePlugin = plugins.find(plugin => plugin.info?.is_active);
    
    // if there is an activated plugin, display the confirmation dialog
    if (activePlugin) {
      setPluginToActivate(selectedPlugin);
      setDeployDialogOpen(true);
    } else {
      // if there is no activated plugin, execute the activate operation directly
      executeDeployAction();
    }
  };

  // close deploy confirmation dialog
  const handleCloseDeployDialog = () => {
    setDeployDialogOpen(false);
    setPluginToActivate(null);
  };

  // actually execute the deploy operation
  const executeDeployAction = async () => {
    setIsDeploying(true);
    
    try {
      // use query parameter to pass plugin_name
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
      
      // refresh the plugin list
      await fetchPlugins();
      
      // get the status of the currently selected plugin
      const updatedPlugin = plugins.find(p => p.name === selectedPlugin);
      const isActive = updatedPlugin?.info?.is_active;
      
      // only show success message after confirming the request succeeds
      showSnackbar(
        isActive 
          ? `Plugin "${selectedPlugin}" activated successfully!` 
          : `Plugin "${selectedPlugin}" deactivated successfully!`, 
        'success'
      );
    } catch (error) {
      console.error('Deploy error:', error);
      
      // try to refresh the plugin list, in case the backend operation has succeeded but the response is wrong
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

  // activate plugin
  const handleDeploy = () => {
    handleOpenDeployDialog();
  };

  // get the status of the currently selected plugin
  const getSelectedPluginStatus = () => {
    const plugin = plugins.find(p => p.name === selectedPlugin);
    return plugin?.info?.is_active || false;
  };

  // check if the plugin is activated
  const isPluginActive = (pluginName) => {
    const plugin = plugins.find(p => p.name === pluginName);
    return plugin?.info?.is_active || false;
  };

  // check if the current plugin is editable
  const isCurrentPluginEditable = () => {
    // new plugin or non-activated existing plugin can be edited
    return !selectedPlugin || (selectedPlugin && !isPluginActive(selectedPlugin));
  };

  // open delete confirmation dialog
  const handleOpenDeleteDialog = (event, pluginName) => {
    event.stopPropagation(); // prevent event bubbling, avoid triggering the selected plugin
    setPluginToDelete(pluginName);
    setDeleteDialogOpen(true);
  };

  // close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPluginToDelete(null);
  };

  // handle switching to other plugins
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

    // if skipConfirmation is true, execute the switch directly
    if (skipConfirmation) {
      switchAction();
      return;
    }

    // check if there are unsaved changes
    if ((hasUnsavedChanges && code.trim() !== originalCode.trim()) || 
        (!selectedPlugin && code.trim() === defaultTemplate.trim())) {
      setPendingAction({ action: switchAction, args: [] });
      setConfirmDialogOpen(true);
    } else {
      switchAction();
    }
  };

  // handle selecting a plugin
  const handleSelectPlugin = (pluginName) => {
    // Don't do anything if clicking the already selected plugin
    if (pluginName === selectedPlugin) {
      return;
    }
    switchToPlugin(pluginName);
  };

  // handle deleting a plugin
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
      
      // if the deleted plugin is the currently selected plugin, clear the selected state
      if (selectedPlugin === pluginToDelete) {
        setSelectedPlugin(null);
      }
      
      // first remove the plugin directly from the local state
      setPlugins(prevPlugins => prevPlugins.filter(plugin => plugin.name !== pluginToDelete));
      
      // then get the latest plugin list from the server
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

  // open menu
  const handleOpenMenu = (event, pluginName) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setActivePluginForMenu(pluginName);
  };

  // close menu
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setActivePluginForMenu(null);
  };

  // handle toggle switch
  const handleToggleSwitch = async (event, pluginName) => {
    event.stopPropagation();

    // create toggle operation function
    const executeToggle = async () => {
      setIsDeploying(true);
      try {
        // get the current status of the plugin
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

        // refresh the plugin list to get the latest status
        await fetchPlugins();
        
        // if the switch is not the currently selected plugin, switch to it (skip confirmation)
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

    // check if there are unsaved changes
    if ((hasUnsavedChanges && code.trim() !== originalCode.trim()) || 
        (!selectedPlugin && code.trim() === defaultTemplate.trim())) {
      setPendingAction({ action: executeToggle, args: [] });
      setConfirmDialogOpen(true);
    } else {
      await executeToggle();
    }
  };

  // create new plugin
  const handleCreateNew = () => {
    const createNewPlugin = () => {
      setSelectedPlugin(null);
      setCode(defaultTemplate);
      setOriginalCode('');  // set to empty string, so the new template will be considered unsaved changes
      setHasUnsavedChanges(true);  // set to unsaved state directly
    };

    // check if there are unsaved changes
    if (hasUnsavedChanges && code.trim() !== originalCode.trim()) {
      setPendingAction({ action: createNewPlugin, args: [] });
      setConfirmDialogOpen(true);
    } else {
      createNewPlugin();
    }
  };

  // discard new plugin
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
      {/* Snackbar notification */}
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
      
      {/* delete confirmation dialog */}
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
      
      {/* deploy confirmation dialog */}
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
      
      {/* unsaved changes confirmation dialog */}
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
      
      {/* background decoration circle */}
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

      {/* content area */}
      <Box sx={{ width: '100%', maxWidth: '1200px', zIndex: 1, height: 'calc(100% - 20px)', display: 'flex', flexDirection: 'column' }}>
        {/* return button and title */}
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
            Middleware Plugin Deployment
          </Typography>
        </Box>

        {/* description text */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ color: '#eee' }}>
            Insert a Python middleware before the LLaMA call, and apply detection logic after the model responds.
        </Typography>
      </Box>

        {/* left and right layout container */}
        <Box sx={{ display: 'flex', gap: 3, flex: 1, overflow: 'hidden' }}>
          {/* left plugin list */}
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

            {/* add navigation hint - show when there is an activated plugin */}
            {plugins.some(plugin => plugin.info?.is_active) && (
              <Box 
                sx={{ 
                  mt: 2,
                  p: 2, 
                  borderRadius: '8px',
                  background: 'linear-gradient(45deg, rgba(187, 134, 252, 0.1), rgba(166, 4, 242, 0.1))',
                  border: '1px solid rgba(187, 134, 252, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.5
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#bb86fc',
                    textAlign: 'center'
                  }}
                >
                  Ready to test your plugins?
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/attack/final')}
                  sx={{
                    background: 'linear-gradient(to right, #bb86fc, #a647f5)',
                    width: '100%',
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(to right, #c996ff, #b057ff)',
                      boxShadow: '0 4px 8px rgba(187, 134, 252, 0.3)',
                    },
                  }}
                >
                  Final Challenge
                </Button>
              </Box>
            )}
          </Box>

          {/* right code editor */}
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
                  // existing plugin shows read-only title
                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                    {`${selectedPlugin}.py`}
                  </Typography>
                ) : (
                  // new plugin shows read-only title
                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                    {`Custom Defense.py`}
                  </Typography>
                )}
                
                {selectedPlugin ? (
                  // existing plugin shows read-only description
                  <Typography variant="body2" sx={{ color: '#aaa' }}>
                    {plugins.find(p => p.name === selectedPlugin)?.description || 'Python middleware plugin'}
                  </Typography>
                ) : (
                  // new plugin shows read-only description
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
                      // only mark as unsaved if there's an actual difference
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
                      {/* always show Discard changes button, but disable based on status */}
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
        
        {/* plugin operation menu */}
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