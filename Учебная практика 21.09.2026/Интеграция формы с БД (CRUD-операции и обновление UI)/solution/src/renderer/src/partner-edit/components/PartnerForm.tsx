import { JSX, useState } from 'react'
import type { PartnerWithDiscount, PartnerInput, PartnerType } from '../../shared/types'
import { formatPhone, normalizePhone, isValidPhone } from '../../shared/phone'

const PARTNER_TYPES: PartnerType[] = ['ЗАО', 'ООО', 'ИП', 'ТК', 'ПАО']

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

interface Props {
  initial: PartnerWithDiscount | null
  onSubmit: (data: PartnerInput) => void
  onCancel: () => void
}

export default function PartnerForm({ initial, onSubmit, onCancel }: Props): JSX.Element {
  const [companyName, setCompanyName] = useState(initial?.company_name ?? '')
  const [partnerType, setPartnerType] = useState<PartnerType>(initial?.partner_type ?? 'ООО')
  const [inn, setInn] = useState(initial?.inn ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [directorName, setDirectorName] = useState(initial?.director_name ?? '')

  // Инициализируем поле уже отформатированным значением
  const [phone, setPhone] = useState(initial?.phone ? formatPhone(initial.phone) : '')

  const [email, setEmail] = useState(initial?.contact_email ?? '')
  const [rating, setRating] = useState<number>(initial?.rating ?? 0)
  const [formError, setFormError] = useState('')

  // На каждый ввод форматируем и обрезаем до 11 цифр
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPhone(formatPhone(e.target.value))
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    const trimmedCompany = companyName.trim()
    const trimmedInn = inn.trim()
    const trimmedEmail = email.trim()
    const normalizedPhone = normalizePhone(phone)

    if (!trimmedCompany) {
      setFormError('Укажите название партнёра')
      return
    }
    if (!/^\d{10}$|^\d{12}$/.test(trimmedInn)) {
      setFormError('ИНН должен содержать 10 или 12 цифр')
      return
    }
    if (phone && !isValidPhone(phone)) {
      setFormError('Телефон должен содержать 11 цифр, например: +7 (904) 303-2211')
      return
    }
    if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
      setFormError('Укажите корректный email, например: name@company.ru')
      return
    }
    if (!Number.isInteger(rating) || rating < 0) {
      setFormError('Рейтинг должен быть целым неотрицательным числом')
      return
    }

    setFormError('')

    onSubmit({
      company_name: trimmedCompany,
      partner_type: partnerType,
      inn: trimmedInn,
      address: address.trim() || null,
      director_name: directorName.trim() || null,
      contact_email: trimmedEmail || null,
      // В БД уходит нормализованный вид: +79043032211
      phone: normalizedPhone || null,
      rating
    })
  }

  return (
    <form className="partner-form" onSubmit={handleSubmit} noValidate>
      <h2 className="partner-form__title">
        {initial ? 'Редактирование партнёра' : 'Новый партнёр'}
      </h2>

      <label className="field">
        <span className="field__label">Наименование</span>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="ООО «Ромашка»"
        />
      </label>

      <label className="field">
        <span className="field__label">Тип партнера</span>
        <select value={partnerType} onChange={(e) => setPartnerType(e.target.value as PartnerType)}>
          {PARTNER_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field__label">ИНН</span>
        <input
          type="text"
          value={inn}
          onChange={(e) => setInn(e.target.value)}
          placeholder="7701234567"
          title="10 цифр для ООО или 12 для ИП"
        />
      </label>

      <label className="field">
        <span className="field__label">Адрес</span>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="г. Москва, ул. Ленина, д. 1"
        />
      </label>

      <label className="field">
        <span className="field__label">ФИО директора</span>
        <input
          type="text"
          value={directorName}
          onChange={(e) => setDirectorName(e.target.value)}
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
        <span className="field__label">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@company.ru"
          title="Формат: имя@домен.зона"
        />
      </label>

      <label className="field">
        <span className="field__label">Рейтинг</span>
        <input
          type="number"
          min={0}
          step={1}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          placeholder="0"
        />
      </label>

      {formError && <div className="form-error">{formError}</div>}

      <div className="partner-form__actions">
        <button type="submit" className="btn btn--primary">
          Сохранить
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Назад
        </button>
      </div>
    </form>
  )
}
