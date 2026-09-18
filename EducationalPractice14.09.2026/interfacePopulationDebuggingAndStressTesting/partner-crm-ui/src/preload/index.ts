import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getPartners: () => ipcRenderer.invoke('partners:list')
})
