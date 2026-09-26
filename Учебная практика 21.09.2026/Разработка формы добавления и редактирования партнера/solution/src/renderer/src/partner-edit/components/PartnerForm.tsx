import { JSX, useState } from 'react'
import { formatPhone, normalizePhone, isValidPhone } from '../../utils/phone'

type PartnerType = 'ЗАО' | 'ООО' | 'ИП' | 'ТК' | 'ПАО'

const PARTNER_TYPES: PartnerType[] = ['ЗАО', 'ООО', 'ИП', 'ТК', 'ПАО']

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function PartnerForm(): JSX.Element {
  const [companyName, setCompanyName] = useState('')
  const [partnerType, setPartnerType] = useState<PartnerType>('ООО')
  const [inn, setInn] = useState('')
  const [address, setAddress] = useState('')
  const [directorName, setDirectorName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState<number>(0)
  const [formError, setFormError] = useState('')
  const [saved, setSaved] = useState(false)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPhone(formatPhone(e.target.value))
  }

  const handleBack = (): void => {
    // Закрываем текущее окно через IPC.
    // Сбрасывать состояние не нужно — окно уничтожается вместе с React-деревом.
    window.electronAPI.closeCurrentWindow()
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    setSaved(false)

    const trimmedCompany = companyName.trim()
    const trimmedInn = inn.trim()
    const trimmedEmail = email.trim()

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

    // Данные никуда не уходят — только показываем, что форма валидна.
    // Здесь было бы обращение к БД или IPC в реальном проекте.
    console.log('Форма валидна. Данные:', {
      company_name: trimmedCompany,
      partner_type: partnerType,
      inn: trimmedInn,
      address: address.trim() || null,
      director_name: directorName.trim() || null,
      phone: normalizePhone(phone) || null,
      contact_email: trimmedEmail || null,
      rating
    })

    setSaved(true)
  }

  return (
    <form className="partner-form" onSubmit={handleSubmit} noValidate>
      <h2 className="partner-form__title">Карточка партнера</h2>

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
      {saved && <div className="form-success">Форма заполнена корректно</div>}

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
