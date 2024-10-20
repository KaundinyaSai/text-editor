const { contextBridge, ipcRenderer } = require("electron");

// Expose ipcRenderer to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  onMenuButtonClick: (callback) => ipcRenderer.on("Theme-Change", callback),
});
