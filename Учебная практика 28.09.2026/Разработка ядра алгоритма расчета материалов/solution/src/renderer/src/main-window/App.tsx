import { useEffect, useState, JSX } from 'react'
import Header from './components/Header'
import Toolbar from './components/Toolbar'
import PartnerCard from './components/PartnerCard'
import type { PartnerWithDiscount } from '../shared/types'

type Status = 'loading' | 'ready' | 'error'

export default function App(): JSX.Element {
  const [partners, setPartners] = useState<PartnerWithDiscount[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [selected, setSelected] = useState<PartnerWithDiscount | null>(null)

  const fetchData = async (): Promise<void> => {
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

  useEffect(() => {
    let ignore = false

    const load = async (): Promise<void> => {
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

    load()

    const unsubscribe = window.electronAPI.onPartnersChanged(() => {
      fetchData()
    })

    return () => {
      ignore = true
      unsubscribe()
    }
  }, [])

  const handleRefresh = async (): Promise<void> => {
    setStatus('loading')
    setErrorMessage('')
    await fetchData()
  }

  const handleOpenHistory = (): void => {
    if (!selected) return
    window.electronAPI.openPartnerHistory(selected.partner_id, selected.company_name)
  }

  return (
    <div className="app">
      <Header />

      <Toolbar
        onAdd={() => window.electronAPI.openPartnerEdit()}
        onRefresh={handleRefresh}
        onOpenHistory={handleOpenHistory}
        historyDisabled={!selected}
      />

      <main className="partners-list">
        {status === 'loading' && <div className="state">Загрузка…</div>}
        {status === 'error' && <div className="state state--error">Ошибка: {errorMessage}</div>}
        {status === 'ready' && partners.length === 0 && (
          <div className="state">Нет данных о партнёрах</div>
        )}
        {status === 'ready' &&
          partners.map((p) => (
            <PartnerCard
              key={p.partner_id}
              partner={p}
              selected={selected?.partner_id === p.partner_id}
              onSelect={() => setSelected(p)}
              onOpen={() => window.electronAPI.openPartnerEdit(p.partner_id)}
            />
          ))}
      </main>
    </div>
  )
}
