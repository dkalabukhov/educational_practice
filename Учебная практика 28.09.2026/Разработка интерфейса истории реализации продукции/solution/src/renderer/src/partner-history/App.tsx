import { useEffect, useState, JSX } from 'react'
import HistoryTable from './components/HistoryTable'
import type { SaleRecord } from '../shared/types'

function getQueryParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name)
}

function parsePartnerId(raw: string | null): number | undefined {
  if (!raw) return undefined
  const n = Number(raw)
  return Number.isFinite(n) ? n : undefined
}

export default function App(): JSX.Element {
  // Читаем и валидируем параметры ОДИН РАЗ при первом рендере.
  // Никакого setState в теле эффекта — начальное состояние сразу корректное.
  const [partnerId] = useState(() => parsePartnerId(getQueryParam('partnerId')))
  const [partnerName] = useState(() => getQueryParam('partnerName') ?? 'Партнёр')

  const [records, setRecords] = useState<SaleRecord[]>([])
  const [loading, setLoading] = useState<boolean>(partnerId !== undefined)
  const [error, setError] = useState<string>(
    partnerId === undefined ? 'Не удалось определить партнёра.' : ''
  )

  useEffect(() => {
    if (partnerId === undefined) return

    let ignore = false

    const load = async (): Promise<void> => {
      try {
        const data = await window.electronAPI.getPartnerHistory(partnerId)
        if (ignore) return
        setRecords(Array.isArray(data) ? data : [])
      } catch (err) {
        if (ignore) return
        setError(err instanceof Error ? err.message : 'Не удалось загрузить историю')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [partnerId])

  return (
    <div className="history-window">
      <header className="history-header">
        <h1 className="history-title">История реализации продукции — {partnerName}</h1>
      </header>

      <main className="history-body">
        {loading && <div className="state">Загрузка истории…</div>}
        {error && <div className="state state--error">Ошибка: {error}</div>}
        {!loading && !error && <HistoryTable records={records} />}
      </main>

      <footer className="history-footer">
        <button className="btn" onClick={() => window.electronAPI.closeCurrentWindow()}>
          Назад
        </button>
      </footer>
    </div>
  )
}
