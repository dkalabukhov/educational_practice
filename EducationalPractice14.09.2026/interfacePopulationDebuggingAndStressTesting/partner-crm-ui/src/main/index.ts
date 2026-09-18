import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import appIcon from '../../resources/icon.png?asset'
import { getPartnersWithDiscount } from './partnerService'

function createWindow(): void {
  const win = new BrowserWindow({
    width: 900,
    height: 720,
    title: 'CRM: Список партнеров и скидок',
    icon: appIcon,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js')
    }
  })

  if (process.env.NODE_ENV === 'development') {
    win.loadURL(process.env.ELECTRON_RENDERER_URL!)
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

ipcMain.handle('partners:list', async () => {
  try {
    return await getPartnersWithDiscount()
  } catch (err) {
    console.error('[partners:list]', err)
    throw new Error('Не удалось загрузить список партнёров')
  }
})

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    if (app.dock) {
      app.dock.setIcon(appIcon)
    }
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
