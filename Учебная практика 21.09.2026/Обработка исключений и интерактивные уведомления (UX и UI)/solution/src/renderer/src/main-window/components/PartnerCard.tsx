import { JSX } from 'react/jsx-runtime'
import type { PartnerWithDiscount } from '../../shared/types'

interface Props {
  partner: PartnerWithDiscount
  onOpen: () => void
}

export default function PartnerCard({ partner, onOpen }: Props): JSX.Element {
  return (
    <div
      className="partner-card"
      onDoubleClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen()
      }}
    >
      <div className="partner-card__left">
        <div className="partner-card__title">
          {partner.partner_type} | {partner.company_name}
        </div>
        <div className="partner-card__role">{partner.director_name ?? 'Директор не указан'}</div>
        <div className="partner-card__phone">{partner.phone ?? '—'}</div>
        <div className="partner-card__rating">Рейтинг: {partner.rating}</div>
      </div>

      <div className="partner-card__discount">{partner.discount_percent}%</div>
    </div>
  )
}
