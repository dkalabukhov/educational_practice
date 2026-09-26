import { pool } from './db'

function calculatePartnerDiscount(totalQuantity: number): number {
  if (totalQuantity < 10_000) {
    return 0
  }
  if (totalQuantity < 50_000) {
    return 5
  }
  if (totalQuantity < 300_000) {
    return 10
  }
  return 15
}

export interface PartnerWithDiscount {
  partner_id: number
  company_name: string
  inn: string
  contact_email: string | null
  phone: string | null
  rating: string
  total_quantity: number
  discount_percent: number
}

const SQL = `
  SELECT
      p.partner_id,
      p.company_name,
      p.inn,
      p.contact_email,
      p.phone,
      p.rating,
      COALESCE(SUM(s.quantity), 0)::INT AS total_quantity
  FROM partners p
  LEFT JOIN sales_history s ON s.partner_id = p.partner_id
  GROUP BY p.partner_id, p.company_name, p.inn,
           p.contact_email, p.phone, p.rating
  ORDER BY p.partner_id;
`

export async function getPartnersWithDiscount(): Promise<PartnerWithDiscount[]> {
  const { rows } = await pool.query(SQL)

  return rows.map((row) => {
    const totalQuantity = Number(row.total_quantity)
    const discountPercent = calculatePartnerDiscount(totalQuantity)
    return {
      partner_id: row.partner_id,
      company_name: row.company_name,
      inn: row.inn,
      contact_email: row.contact_email,
      phone: row.phone,
      rating: row.rating,
      total_quantity: totalQuantity,
      discount_percent: discountPercent
    }
  })
}
