import { app, ipcMain, BrowserWindow } from 'electron'
import appIcon from '../../resources/icon.png?asset'
import { createMainWindow, createPartnerEditWindow, createPartnerHistoryWindow } from './windows'
import { showDialog } from './dialogs'
import {
  getPartnersWithDiscount,
  getPartnerById,
  createPartner,
  updatePartner,
  getPartnerHistory
} from './partnerService'

function notifyPartnersChanged(): void {
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

// Диалоги вызываются из рендерера через IPC
ipcMain.handle('dialog:show', async (_e, type, title, message, detail) =>
  showDialog(type, title, message, detail)
)

ipcMain.handle('partners:list', async () => {
  try {
    return await getPartnersWithDiscount()
  } catch (err) {
    await showDialog(
      'error',
      'Ошибка подключения к БД',
      'Не удалось загрузить список партнёров.',
      'Проверьте, запущен ли сервер PostgreSQL, и повторите попытку.'
    )
    throw err
  }
})

ipcMain.handle('partners:get', async (_e, partnerId: number) => {
  try {
    return await getPartnerById(partnerId)
  } catch (err) {
    await showDialog(
      'error',
      'Ошибка загрузки',
      'Не удалось загрузить данные партнёра.',
      'Проверьте соединение с БД и повторите попытку.'
    )
    throw err
  }
})

ipcMain.handle('partners:create', async (_e, data) => {
  try {
    const newId = await createPartner(data)
    await showDialog(
      'info',
      'Партнёр добавлен',
      'Новый партнёр успешно сохранён в базу данных.',
      `Присвоенный идентификатор: ${newId}`
    )
    notifyPartnersChanged()
    return newId
  } catch (err) {
    await showDialog(
      'error',
      'Ошибка сохранения',
      err instanceof Error ? err.message : 'Не удалось сохранить партнёра.',
      'Исправьте данные и повторите попытку.'
    )
    throw err
  }
})

ipcMain.handle('partners:update', async (_e, partnerId: number, data) => {
  try {
    await updatePartner(partnerId, data)
    await showDialog(
      'info',
      'Изменения сохранены',
      'Данные партнёра успешно обновлены.',
      `Идентификатор: ${partnerId}`
    )
    notifyPartnersChanged()
  } catch (err) {
    await showDialog(
      'error',
      'Ошибка сохранения',
      err instanceof Error ? err.message : 'Не удалось обновить партнёра.',
      'Исправьте данные и повторите попытку.'
    )
    throw err
  }
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

ipcMain.handle('window:open-partner-history', (_e, partnerId: number, partnerName: string) => {
  createPartnerHistoryWindow(partnerId, partnerName)
})

ipcMain.handle('partners:history', async (_e, partnerId: number) => {
  try {
    return await getPartnerHistory(partnerId)
  } catch (err) {
    await showDialog(
      'error',
      'Ошибка загрузки истории',
      'Не удалось загрузить историю продаж партнёра.',
      'Проверьте соединение с БД и повторите попытку.'
    )
    throw err
  }
})
