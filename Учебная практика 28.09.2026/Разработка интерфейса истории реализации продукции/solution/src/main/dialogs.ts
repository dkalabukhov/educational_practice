import { dialog, BrowserWindow } from 'electron'

type DialogType = 'error' | 'warning' | 'info'

// Показывает системное диалоговое окно и возвращает true,
// если пользователь подтвердил действие (для warning).
export async function showDialog(
  type: DialogType,
  title: string,
  message: string,
  detail?: string
): Promise<boolean> {
  const focused = BrowserWindow.getFocusedWindow() ?? undefined

  const buttons = type === 'warning' ? ['Продолжить', 'Отмена'] : ['ОК']

  const result = await dialog.showMessageBox(focused!, {
    type,
    title,
    message,
    detail,
    buttons,
    defaultId: type === 'warning' ? 1 : 0,
    cancelId: type === 'warning' ? 1 : 0,
    noLink: true
  })

  // Для warning: 0 — «Продолжить», 1 — «Отмена»
  return result.response === 0
}
