import { app, ipcMain, BrowserWindow } from 'electron'
import appIcon from '../../resources/icon.png?asset'
import { createMainWindow, createPartnerEditWindow } from './windows'
import {
  getPartnersWithDiscount,
  getPartnerById,
  createPartner,
  updatePartner
} from './partnerService'

// Уведомляем главное окно, что данные изменились —
// чтобы оно перезагрузило список без ручного «Обновить».
function notifyMainWindowPartnersChanged(): void {
  BrowserWindow.getAllWindows().forEach((w) => {
    if (w.getTitle().includes('Реестр')) {
      w.webContents.send('partners:changed')
    }
  })
}

ipcMain.handle('window:open-main', () => {
  createMainWindow()
})

ipcMain.handle('window:open-partner-edit', (_e, partnerId?: number) => {
  createPartnerEditWindow(partnerId)
})

ipcMain.handle('window:close-current', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  win?.close()
})

ipcMain.handle('partners:list', async () => {
  return await getPartnersWithDiscount()
})

ipcMain.handle('partners:get', async (_e, partnerId: number) => {
  return await getPartnerById(partnerId)
})

ipcMain.handle('partners:create', async (_e, data) => {
  const newId = await createPartner(data)
  notifyMainWindowPartnersChanged()
  return newId
})

ipcMain.handle('partners:update', async (_e, partnerId: number, data) => {
  await updatePartner(partnerId, data)
  notifyMainWindowPartnersChanged()
})

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    if (app.dock) {
      app.dock.setIcon(appIcon)
    }
  }

  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
