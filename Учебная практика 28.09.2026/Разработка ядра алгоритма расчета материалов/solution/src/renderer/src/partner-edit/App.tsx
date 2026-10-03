import { JSX, useEffect, useState } from 'react'
import PartnerForm from './components/PartnerForm'
import type { PartnerWithDiscount, PartnerInput } from '../shared/types'

function getPartnerIdFromUrl(): number | undefined {
  const params = new URLSearchParams(window.location.search)
  const raw = params.get('partnerId')
  if (!raw) return undefined
  const n = Number(raw)
  return Number.isFinite(n) ? n : undefined
}

export default function PartnerEditApp(): JSX.Element {
  const partnerId = getPartnerIdFromUrl()
  const isEdit = partnerId !== undefined

  const [partner, setPartner] = useState<PartnerWithDiscount | null>(null)
  const [loading, setLoading] = useState<boolean>(isEdit)
  const [fatalError, setFatalError] = useState<string>('')

  useEffect(() => {
    if (!isEdit) return

    let ignore = false

    const load = async (): Promise<void> => {
      try {
        const data = await window.electronAPI.getPartner(partnerId)
        if (ignore) return
        if (!data) {
          setFatalError('Партнёр не найден в базе данных.')
        } else {
          setPartner(data)
        }
      } catch (err) {
        if (ignore) return
        setFatalError(err instanceof Error ? err.message : 'Не удалось загрузить данные')
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
    if (isEdit) {
      await window.electronAPI.updatePartner(partnerId, data)
    } else {
      await window.electronAPI.createPartner(data)
    }
    // Диалог «Изменения сохранены» показывает главный процесс — здесь
    // просто закрываем окно.
    await window.electronAPI.closeCurrentWindow()
  }

  const handleBack = (): void => {
    window.electronAPI.closeCurrentWindow()
  }

  if (loading) {
    return <div className="state">Загрузка данных…</div>
  }

  if (fatalError) {
    return <div className="state state--error">{fatalError}</div>
  }

  return (
    <div className="edit-window">
      <PartnerForm initial={partner} onSubmit={handleSubmit} onBack={handleBack} />
    </div>
  )
}
