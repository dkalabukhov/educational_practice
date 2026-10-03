import { JSX, useState } from 'react'
import { formatPhone, normalizePhone, isValidPhone } from '../../shared/phone'
import type { PartnerWithDiscount, PartnerInput, PartnerType } from '../../shared/types'

const PARTNER_TYPES: PartnerType[] = ['ЗАО', 'ООО', 'ИП', 'ТК', 'ПАО']

interface Props {
  initial: PartnerWithDiscount | null
  onSubmit: (data: PartnerInput) => Promise<void>
  onBack: () => void
}

export default function PartnerForm({ initial, onSubmit, onBack }: Props): JSX.Element {
  const [companyName, setCompanyName] = useState(initial?.company_name ?? '')
  const [partnerType, setPartnerType] = useState<PartnerType>(initial?.partner_type ?? 'ООО')
  const [inn, setInn] = useState(initial?.inn ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [directorName, setDirectorName] = useState(initial?.director_name ?? '')
  const [phone, setPhone] = useState(initial?.phone ? formatPhone(initial.phone) : '')
  const [email, setEmail] = useState(initial?.contact_email ?? '')
  const [rating, setRating] = useState<number>(initial?.rating ?? 0)

  // Флаг «пользователь что-то менял» — нужен для Warning при «Назад»
  const [isDirty, setIsDirty] = useState(false)

  const markDirty = (): void => {
    if (!isDirty) setIsDirty(true)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPhone(formatPhone(e.target.value))
    markDirty()
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    try {
      // --- Клиентская валидация (быстрая проверка перед отправкой) ---
      const trimmedCompany = companyName.trim()
      const trimmedInn = inn.trim()
      const trimmedEmail = email.trim()

      if (!trimmedCompany) {
        throw new Error(
          'Наименование партнёра не заполнено.\n' +
            'Введите название компании в поле «Наименование» и повторите попытку.'
        )
      }
      if (!trimmedEmail) {
        throw new Error(
          'Email партнёра не заполнен.\n' +
            'Укажите email в формате name@company.ru и повторите попытку.'
        )
      }
      if (!/^\d{10}$|^\d{12}$/.test(trimmedInn)) {
        throw new Error(
          'ИНН должен содержать 10 или 12 цифр.\n' +
            'Проверьте количество цифр и отсутствие букв, затем повторите попытку.'
        )
      }
      if (phone && !isValidPhone(phone)) {
        throw new Error(
          'Телефон должен содержать 11 цифр.\n' + 'Пример корректного ввода: +7 (904) 303-2211.'
        )
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
        throw new Error(
          'Email указан в неверном формате.\n' +
            'Используйте формат name@company.ru, без пробелов и лишних символов.'
        )
      }
      if (!Number.isInteger(rating) || rating < 0) {
        throw new Error(
          'Рейтинг должен быть целым числом от 0.\n' +
            'Удалите знаки препинания и буквы, введите целое неотрицательное число.'
        )
      }

      // --- Отправка в БД ---
      await onSubmit({
        company_name: trimmedCompany,
        partner_type: partnerType,
        inn: trimmedInn,
        address: address.trim() || null,
        director_name: directorName.trim() || null,
        contact_email: trimmedEmail,
        phone: normalizePhone(phone) || null,
        rating
      })

      setIsDirty(false)
    } catch (err) {
      // Ошибки валидации и ошибки БД — один путь, одно диалоговое окно
      await window.electronAPI.showDialog(
        'error',
        'Ошибка сохранения',
        err instanceof Error ? err.message.split('\n')[0] : 'Неизвестная ошибка',
        err instanceof Error && err.message.includes('\n')
          ? err.message.split('\n').slice(1).join('\n')
          : 'Исправьте данные и повторите попытку.'
      )
    }
  }

  const handleBack = async (): Promise<void> => {
    if (isDirty) {
      const confirmed = await window.electronAPI.showDialog(
        'warning',
        'Несохранённые изменения',
        'Вы изменили данные партнёра, но не сохранили их.',
        'Если вы продолжите, все внесённые изменения будут потеряны. ' +
          'Нажмите «Продолжить», чтобы выйти без сохранения, или «Отмена», чтобы вернуться к форме.'
      )
      if (!confirmed) return
    }
    onBack()
  }

  return (
    <form className="partner-form" onSubmit={handleSubmit} noValidate>
      <h2 className="partner-form__title">
        {initial ? 'Редактирование партнёра' : 'Новый партнёр'}
      </h2>

      <label className="field">
        <span className="field__label">Наименование *</span>
        <input
          type="text"
          value={companyName}
          onChange={(e) => {
            setCompanyName(e.target.value)
            markDirty()
          }}
          placeholder="ООО «Ромашка»"
        />
      </label>

      <label className="field">
        <span className="field__label">Тип партнера</span>
        <select
          value={partnerType}
          onChange={(e) => {
            setPartnerType(e.target.value as PartnerType)
            markDirty()
          }}
        >
          {PARTNER_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field__label">ИНН *</span>
        <input
          type="text"
          value={inn}
          onChange={(e) => {
            setInn(e.target.value)
            markDirty()
          }}
          placeholder="7701234567"
          title="10 цифр для ООО или 12 для ИП"
        />
      </label>

      <label className="field">
        <span className="field__label">Адрес</span>
        <input
          type="text"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value)
            markDirty()
          }}
          placeholder="г. Москва, ул. Ленина, д. 1"
        />
      </label>

      <label className="field">
        <span className="field__label">ФИО директора</span>
        <input
          type="text"
          value={directorName}
          onChange={(e) => {
            setDirectorName(e.target.value)
            markDirty()
          }}
          placeholder="Иванов Иван Иванович"
        />
      </label>

      <label className="field">
        <span className="field__label">Телефон</span>
        <input
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="+7 (___) ___-__-__"
          title="Введите 11 цифр, начиная с 7 или 8"
        />
      </label>

      <label className="field">
        <span className="field__label">Email *</span>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            markDirty()
          }}
          placeholder="example@company.ru"
          title="Формат: имя@домен.зона"
        />
      </label>

      <label className="field">
        <span className="field__label">Рейтинг *</span>
        <input
          type="number"
          min={0}
          step={1}
          value={rating}
          onChange={(e) => {
            setRating(Number(e.target.value))
            markDirty()
          }}
          placeholder="0"
        />
      </label>

      <div className="partner-form__actions">
        <button type="submit" className="btn btn--primary">
          Сохранить
        </button>
        <button type="button" className="btn" onClick={handleBack}>
          Назад
        </button>
      </div>
    </form>
  )
}
