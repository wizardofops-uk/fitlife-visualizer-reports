const { contextBridge, ipcRenderer, shell } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    on: (channel, callback) => {
      ipcRenderer.on(channel, callback);
    },
    removeListener: (channel, callback) => {
      ipcRenderer.removeListener(channel, callback);
    },
    openExternal: (url) => {
      shell.openExternal(url);
    },
    fitbitExchangeToken: (params) => ipcRenderer.invoke('fitbit-exchange-token', params),
    fitbitApiFetch: (params) => ipcRenderer.invoke('fitbit-api-fetch', params),
  }
);

contextBridge.exposeInMainWorld('electronAPI', {
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body })
}); 