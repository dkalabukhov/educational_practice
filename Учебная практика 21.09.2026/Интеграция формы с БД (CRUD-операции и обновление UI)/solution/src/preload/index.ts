import { contextBridge, ipcRenderer } from 'electron'
import type { PartnerInput } from '../shared/types'

contextBridge.exposeInMainWorld('electronAPI', {
  openMainWindow: () => ipcRenderer.invoke('window:open-main'),
  openPartnerEdit: (partnerId?: number) =>
    ipcRenderer.invoke('window:open-partner-edit', partnerId),
  closeCurrentWindow: () => ipcRenderer.invoke('window:close-current'),

  getPartners: () => ipcRenderer.invoke('partners:list'),
  getPartner: (id: number) => ipcRenderer.invoke('partners:get', id),
  createPartner: (data: PartnerInput) => ipcRenderer.invoke('partners:create', data),
  updatePartner: (id: number, data: PartnerInput) =>
    ipcRenderer.invoke('partners:update', id, data),

  // Подписка на изменения: возвращает функцию отписки,
  // чтобы можно было корректно очистить слушателя при размонтировании.
  onPartnersChanged: (cb: () => void) => {
    const handler = (): void => cb()
    ipcRenderer.on('partners:changed', handler)
    return () => ipcRenderer.off('partners:changed', handler)
  }
})
