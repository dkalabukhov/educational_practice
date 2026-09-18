import { useEffect, useState } from 'react'
import { JSX } from 'react/jsx-runtime'
import Header from './components/Header'
import PartnerCard from './components/PartnerCard'
import type { Partner } from './types'

type Status = 'loading' | 'ready' | 'error'

export default function App(): JSX.Element {
  const [partners, setPartners] = useState<Partner[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const data = await window.electronAPI.getPartners()
        setPartners(Array.isArray(data) ? data : [])
        setStatus('ready')
      } catch (err) {
        console.error(err)
        setErrorMessage(err instanceof Error ? err.message : 'Неизвестная ошибка')
        setStatus('error')
      }
    }

    fetchData()
  }, [])

  return (
    <div className="app">
      <Header />

      <main className="partners-list">
        {status === 'loading' && <div className="state">Загрузка данных…</div>}

        {status === 'error' && <div className="state state--error">Ошибка: {errorMessage}</div>}

        {status === 'ready' && partners.length === 0 && (
          <div className="state">Нет данных о партнёрах</div>
        )}

        {status === 'ready' && partners.map((p) => <PartnerCard key={p.partner_id} partner={p} />)}
      </main>
    </div>
  )
}
