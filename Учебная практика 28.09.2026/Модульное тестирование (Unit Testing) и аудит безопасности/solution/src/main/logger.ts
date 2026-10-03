import fs from 'fs'
import path from 'path'
import { app } from 'electron'

/**
 * Путь к app.log в корне проекта.
 *
 * В dev-режиме __dirname указывает на out/main, поэтому поднимаемся на два
 * уровня вверх — в корень проекта.
 *
 * В собранном приложении корень проекта недоступен, поэтому используем
 * app.getPath('userData') как фолбэк, чтобы приложение не падало
 * при попытке записи в защищённую папку.
 */
function resolveLogPath(): string {
  const projectRoot = path.resolve(__dirname, '..', '..')
  const logPath = path.join(projectRoot, 'app.log')

  try {
    fs.accessSync(projectRoot, fs.constants.W_OK)
    return logPath
  } catch {
    return path.join(app.getPath('userData'), 'app.log')
  }
}

const LOG_FILE = resolveLogPath()

function formatTimestamp(): string {
  const now = new Date()
  const pad = (n: number): string => String(n).padStart(2, '0')

  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  )
}

export function logError(message: string, err?: unknown): void {
  const detail =
    err instanceof Error
      ? `${err.message}\n${err.stack ?? ''}`
      : err !== undefined
        ? String(err)
        : ''

  const line = `[${formatTimestamp()}] [ERROR] ${detail ? `${message} — ${detail}` : message}\n`

  console.error(line.trimEnd())

  try {
    fs.appendFileSync(LOG_FILE, line, 'utf8')
  } catch (writeErr) {
    console.error('[logger] Не удалось записать в файл:', writeErr)
  }
}

export function getLogPath(): string {
  return LOG_FILE
}
