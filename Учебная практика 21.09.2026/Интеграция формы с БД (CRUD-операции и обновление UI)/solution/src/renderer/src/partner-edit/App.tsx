import { JSX, useEffect, useState } from 'react'
import PartnerForm from './components/PartnerForm'
import type { Partner, PartnerInput } from '../shared/types'

// partnerId приходит из URL как строка — приводим к number,
// чтобы дальше работать с ним как с числом и не путать режимы.
function getPartnerIdFromUrl(): number | undefined {
  const params = new URLSearchParams(window.location.search)
  const raw = params.get('partnerId')
  if (!raw) return undefined
  const n = Number(raw)
  return Number.isFinite(n) ? n : undefined
}

export default function App(): JSX.Element {
  const partnerId = getPartnerIdFromUrl()
  const isEdit = partnerId !== undefined

  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(isEdit)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return

    let ignore = false

    const load = async (): Promise<void> => {
      try {
        const data = await window.electronAPI.getPartner(partnerId)
        if (ignore) return
        if (!data) {
          setError('Партнёр не найден')
        } else {
          setPartner(data)
        }
      } catch (err) {
        if (ignore) return
        setError(err instanceof Error ? err.message : 'Ошибка загрузки')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [isEdit, partnerId])

  const handleSubmit = async (data: PartnerInput): Promise<void> => {
    try {
      if (isEdit) {
        await window.electronAPI.updatePartner(partnerId, data)
      } else {
        await window.electronAPI.createPartner(data)
      }
      await window.electronAPI.closeCurrentWindow()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    }
  }

  const handleCancel = (): void => {
    window.electronAPI.closeCurrentWindow()
  }

  if (loading) return <div className="state">Загрузка…</div>
  if (error) return <div className="state state--error">Ошибка: {error}</div>

  return (
    <div className="edit-window">
      <PartnerForm initial={partner} onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  )
}
