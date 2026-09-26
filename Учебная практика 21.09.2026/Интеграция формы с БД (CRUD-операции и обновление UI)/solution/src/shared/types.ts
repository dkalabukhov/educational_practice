export type PartnerType = 'ЗАО' | 'ООО' | 'ИП' | 'ТК' | 'ПАО'

export interface PartnerWithDiscount {
  partner_id: number
  company_name: string
  partner_type: PartnerType
  inn: string
  address: string | null
  director_name: string | null
  contact_email: string | null
  phone: string | null
  rating: number
  total_quantity: number
  discount_percent: number
}

export interface PartnerInput {
  company_name: string
  partner_type: PartnerType
  inn: string
  address: string | null
  director_name: string | null
  contact_email: string | null
  phone: string | null
  rating: number
}
