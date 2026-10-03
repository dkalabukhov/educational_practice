import { contextBridge, ipcRenderer } from 'electron'

type DialogType = 'error' | 'warning' | 'info'

contextBridge.exposeInMainWorld('electronAPI', {
  openMainWindow: () => ipcRenderer.invoke('window:open-main'),
  openPartnerEdit: (partnerId?: number) =>
    ipcRenderer.invoke('window:open-partner-edit', partnerId),
  openPartnerHistory: (partnerId: number, partnerName: string) =>
    ipcRenderer.invoke('window:open-partner-history', partnerId, partnerName),
  closeCurrentWindow: () => ipcRenderer.invoke('window:close-current'),

  showDialog: (type: DialogType, title: string, message: string, detail?: string) =>
    ipcRenderer.invoke('dialog:show', type, title, message, detail),

  getPartners: () => ipcRenderer.invoke('partners:list'),
  getPartner: (id: number) => ipcRenderer.invoke('partners:get', id),
  getPartnerHistory: (id: number) => ipcRenderer.invoke('partners:history', id),
  createPartner: (data: unknown) => ipcRenderer.invoke('partners:create', data),
  updatePartner: (id: number, data: unknown) => ipcRenderer.invoke('partners:update', id, data),

  onPartnersChanged: (cb: () => void) => {
    const handler = (): void => cb()
    ipcRenderer.on('partners:changed', handler)
    return () => ipcRenderer.off('partners:changed', handler)
  }
})
