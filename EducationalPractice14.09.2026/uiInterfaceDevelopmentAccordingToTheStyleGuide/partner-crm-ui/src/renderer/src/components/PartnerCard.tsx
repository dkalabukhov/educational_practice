import { JSX } from 'react/jsx-runtime'
import type { Partner } from '../types'

interface Props {
  partner: Partner
}

export default function PartnerCard({ partner }: Props): JSX.Element {
  const partnerType = partner.company_name.startsWith('ИП')
    ? 'ИП'
    : partner.company_name.startsWith('ТК')
      ? 'ТК'
      : 'ООО'

  return (
    <div className="partner-card">
      <div className="partner-card__left">
        <div className="partner-card__title">
          {partnerType} | {partner.company_name}
        </div>
        <div className="partner-card__inn">ИНН: {partner.inn}</div>
        <div className="partner-card__phone">{partner.phone ?? '—'}</div>
        <div className="partner-card__rating">Рейтинг: {partner.rating}</div>
      </div>

      <div className="partner-card__discount">{partner.discount_percent}%</div>
    </div>
  )
}
