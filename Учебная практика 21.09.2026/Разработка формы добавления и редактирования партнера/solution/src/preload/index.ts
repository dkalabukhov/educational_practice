import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openMainWindow: () => ipcRenderer.invoke('window:open-main'),
  openPartnerEdit: () => ipcRenderer.invoke('window:open-partner-edit'),
  closeCurrentWindow: () => ipcRenderer.invoke('window:close-current'),

  getPartners: () => ipcRenderer.invoke('partners:list')
})
