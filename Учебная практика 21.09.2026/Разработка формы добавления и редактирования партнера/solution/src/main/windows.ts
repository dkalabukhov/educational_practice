import { BrowserWindow } from 'electron'
import path from 'path'
import appIcon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow | null = null

const isDev = !!process.env.ELECTRON_RENDERER_URL

export function createMainWindow(): BrowserWindow {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.focus()
    return mainWindow
  }

  mainWindow = new BrowserWindow({
    width: 900,
    height: 720,
    title: 'CRM: Реестр партнеров',
    icon: appIcon,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js')
    }
  })

  if (isDev) {
    mainWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}/index.html`)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  return mainWindow
}

export function createPartnerEditWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 600,
    height: 480,
    title: 'CRM: Карточка партнера [Редактирование]',
    icon: appIcon,
    parent: mainWindow ?? undefined,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js')
    }
  })

  if (isDev) {
    win.loadURL(`${process.env.ELECTRON_RENDERER_URL}/partner-edit.html`)
  } else {
    win.loadFile(path.join(__dirname, '../renderer/partner-edit.html'))
  }

  return win
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}
