export type PartnerType = 'ЗАО' | 'ООО' | 'ИП' | 'ТК' | 'ПАО'

export interface Partner {
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

// Данные, которые форма отправляет в БД.
// Без partner_id, total_quantity, discount_percent — они вычисляются на стороне БД.
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

export interface SaleRecord {
  sale_id: number
  product_name: string
  quantity: number
  sale_date: string
  total_amount: number
  unit_price: number
}
