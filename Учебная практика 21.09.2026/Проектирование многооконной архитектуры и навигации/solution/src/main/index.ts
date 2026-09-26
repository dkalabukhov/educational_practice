import { app, ipcMain, BrowserWindow } from 'electron'
import appIcon from '../../resources/icon.png?asset'
import { createMainWindow, createPartnerEditWindow } from './windows'
import { getPartnersWithDiscount } from './partnerService'

ipcMain.handle('window:open-main', () => {
  createMainWindow()
})

ipcMain.handle('window:open-partner-edit', () => {
  createPartnerEditWindow()
})

ipcMain.handle('window:close-current', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  win?.close()
})

ipcMain.handle('partners:list', async () => {
  return await getPartnersWithDiscount()
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
