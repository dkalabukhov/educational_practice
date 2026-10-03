import { BrowserWindow } from 'electron'
import path from 'path'
import appIcon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow | null = null
const historyWindows = new Map<number, BrowserWindow>()

// Отслеживаем открытые окна редактирования по partner_id,
// чтобы не открывать дубликаты и уметь их закрывать.
const editWindows = new Map<number, BrowserWindow>()

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

export function createPartnerEditWindow(partnerId?: number): BrowserWindow {
  // Если окно для этого партнёра уже открыто — фокусируем его,
  // чтобы не создавать дубликат и не плодить запросы.
  if (partnerId !== undefined) {
    const existing = editWindows.get(partnerId)
    if (existing && !existing.isDestroyed()) {
      existing.focus()
      return existing
    }
  }

  const isEdit = partnerId !== undefined
  const title = isEdit
    ? 'CRM: Карточка партнера [Редактирование]'
    : 'CRM: Карточка партнера [Добавление]'

  const win = new BrowserWindow({
    width: 600,
    height: 620,
    title,
    icon: appIcon,
    parent: mainWindow ?? undefined,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js')
    }
  })

  // partnerId передаётся через query-параметр — это переживает
  // перезагрузку окна и не требует глобального состояния в main.
  const query = isEdit ? `?partnerId=${partnerId}` : ''

  if (isDev) {
    win.loadURL(`${process.env.ELECTRON_RENDERER_URL}/partner-edit.html${query}`)
  } else {
    win.loadFile(path.join(__dirname, '../renderer/partner-edit.html'), { search: query })
  }

  if (partnerId !== undefined) {
    editWindows.set(partnerId, win)
    win.on('closed', () => editWindows.delete(partnerId))
  }

  return win
}

export function createPartnerHistoryWindow(partnerId: number, partnerName: string): BrowserWindow {
  const existing = historyWindows.get(partnerId)
  if (existing && !existing.isDestroyed()) {
    existing.focus()
    return existing
  }

  const win = new BrowserWindow({
    width: 800,
    height: 640,
    title: `CRM: История реализации продукции — ${partnerName}`,
    icon: appIcon,
    parent: mainWindow ?? undefined,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js')
    }
  })

  const query = `?partnerId=${partnerId}&partnerName=${encodeURIComponent(partnerName)}`

  if (isDev) {
    win.loadURL(`${process.env.ELECTRON_RENDERER_URL}/partner-history.html${query}`)
  } else {
    win.loadFile(path.join(__dirname, '../renderer/partner-history.html'), { search: query })
  }

  historyWindows.set(partnerId, win)
  win.on('closed', () => historyWindows.delete(partnerId))

  return win
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}
