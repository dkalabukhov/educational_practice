import { pool } from './db'
import type { PartnerType, PartnerInput } from '../shared/types'

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

const LIST_SQL = `
  SELECT
      p.partner_id,
      p.company_name,
      p.partner_type,
      p.inn,
      p.address,
      p.director_name,
      p.contact_email,
      p.phone,
      p.rating,
      COALESCE(SUM(s.quantity), 0)::INT AS total_quantity
  FROM partners p
  LEFT JOIN sales_history s ON s.partner_id = p.partner_id
  GROUP BY p.partner_id, p.company_name, p.partner_type, p.inn,
           p.address, p.director_name, p.contact_email, p.phone, p.rating
  ORDER BY p.partner_id;
`

export async function getPartnersWithDiscount(): Promise<PartnerWithDiscount[]> {
  const { rows } = await pool.query(LIST_SQL)
  return rows.map((row) => {
    const totalQuantity = Number(row.total_quantity) || 0
    return {
      partner_id: Number(row.partner_id),
      company_name: String(row.company_name ?? ''),
      partner_type: row.partner_type ?? 'ООО',
      inn: String(row.inn ?? ''),
      address: row.address ?? null,
      director_name: row.director_name ?? null,
      contact_email: row.contact_email ?? null,
      phone: row.phone ?? null,
      rating: Number(row.rating) || 0,
      total_quantity: totalQuantity,
      discount_percent: calculatePartnerDiscount(totalQuantity)
    }
  })
}

export async function getPartnerById(id: number): Promise<PartnerWithDiscount | null> {
  const { rows } = await pool.query(
    `SELECT partner_id, company_name, partner_type, inn,
            address, director_name, contact_email, phone, rating
     FROM partners
     WHERE partner_id = $1`,
    [id]
  )
  if (rows.length === 0) return null

  const row = rows[0]
  return {
    partner_id: Number(row.partner_id),
    company_name: String(row.company_name ?? ''),
    partner_type: row.partner_type ?? 'ООО',
    inn: String(row.inn ?? ''),
    address: row.address ?? null,
    director_name: row.director_name ?? null,
    contact_email: row.contact_email ?? null,
    phone: row.phone ?? null,
    rating: Number(row.rating) || 0,
    // Список не запрашивает продажи — для карточки редактирования
    // total_quantity и discount_percent не нужны.
    total_quantity: 0,
    discount_percent: 0
  }
}

export async function createPartner(data: PartnerInput): Promise<number> {
  const { rows } = await pool.query(
    `INSERT INTO partners
       (company_name, partner_type, inn, address, director_name,
        contact_email, phone, rating)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING partner_id`,
    [
      data.company_name,
      data.partner_type,
      data.inn,
      data.address,
      data.director_name,
      data.contact_email,
      data.phone,
      data.rating
    ]
  )
  return Number(rows[0].partner_id)
}

export async function updatePartner(id: number, data: PartnerInput): Promise<void> {
  await pool.query(
    `UPDATE partners
     SET company_name  = $1,
         partner_type  = $2,
         inn           = $3,
         address       = $4,
         director_name = $5,
         contact_email = $6,
         phone         = $7,
         rating        = $8
     WHERE partner_id = $9`,
    [
      data.company_name,
      data.partner_type,
      data.inn,
      data.address,
      data.director_name,
      data.contact_email,
      data.phone,
      data.rating,
      id
    ]
  )
}
