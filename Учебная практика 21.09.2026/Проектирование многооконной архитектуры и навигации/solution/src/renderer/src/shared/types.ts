export interface Partner {
  partner_id: number
  company_name: string
  inn: string
  phone: string | null
  rating: string
  discount_percent: number
}

export interface PartnerInput {
  company_name: string
  inn: string
  contact_email: string | null
  phone: string | null
  rating: number
}
