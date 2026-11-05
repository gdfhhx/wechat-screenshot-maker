const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  saveImage: (payload) => ipcRenderer.invoke('save-image', payload),
  copyImage: (dataUrl) => ipcRenderer.invoke('copy-image', dataUrl),
});
