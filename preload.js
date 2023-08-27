const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    ping: (data) => ipcRenderer.send('ping', data),
    crud: (data) => ipcRenderer.send('crud', data),
})