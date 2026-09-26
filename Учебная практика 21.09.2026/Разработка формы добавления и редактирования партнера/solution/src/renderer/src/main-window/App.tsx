import { JSX, useEffect, useState } from 'react'
import Header from './components/Header'
import Toolbar from './components/Toolbar'
import PartnerCard from './components/PartnerCard'
import type { Partner } from '../shared/types'

type Status = 'loading' | 'ready' | 'error'

export default function App(): JSX.Element {
  const [partners, setPartners] = useState<Partner[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let ignore = false

    const fetchData = async (): Promise<void> => {
      try {
        const data = await window.electronAPI.getPartners()
        if (ignore) return
        setPartners(Array.isArray(data) ? data : [])
        setStatus('ready')
      } catch (err) {
        if (ignore) return
        console.error(err)
        setErrorMessage(err instanceof Error ? err.message : 'Ошибка')
        setStatus('error')
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [])

  const handleRefresh = async (): Promise<void> => {
    setStatus('loading')
    setErrorMessage('')
    try {
      const data = await window.electronAPI.getPartners()
      setPartners(Array.isArray(data) ? data : [])
      setStatus('ready')
    } catch (err) {
      console.error(err)
      setErrorMessage(err instanceof Error ? err.message : 'Ошибка')
      setStatus('error')
    }
  }

  return (
    <div className="app">
      <Header />

      <Toolbar onAdd={() => window.electronAPI.openPartnerEdit()} onRefresh={handleRefresh} />

      <main className="partners-list">
        {status === 'loading' && <div className="state">Загрузка…</div>}
        {status === 'error' && <div className="state state--error">Ошибка: {errorMessage}</div>}
        {status === 'ready' && partners.length === 0 && (
          <div className="state">Нет данных о партнёрах</div>
        )}
        {status === 'ready' && partners.map((p) => <PartnerCard key={p.partner_id} partner={p} />)}
      </main>
    </div>
  )
}
