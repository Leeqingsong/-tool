const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openDevice: (data) => ipcRenderer.invoke('open-device', data)
});
