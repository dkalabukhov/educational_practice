import { pool } from './db'
import { logError } from './logger'
import type { PartnerInput, PartnerWithDiscount, SaleRecord } from '../shared/types'

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

// Валидация перед INSERT/UPDATE. Бросает Error с текстом,
// который рендерер покажет в диалоге.
export function validatePartnerInput(data: PartnerInput): void {
  if (!data.company_name || !data.company_name.trim()) {
    throw new Error(
      'Наименование партнёра не заполнено.\n' +
        'Введите название компании в поле «Наименование» и повторите попытку.'
    )
  }

  if (!data.contact_email || !data.contact_email.trim()) {
    throw new Error(
      'Email партнёра не заполнен.\n' +
        'Укажите email в формате name@company.ru и повторите попытку.'
    )
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  if (!emailRegex.test(data.contact_email.trim())) {
    throw new Error(
      'Email указан в неверном формате.\n' +
        'Используйте формат name@company.ru, без пробелов и лишних символов.'
    )
  }

  const rating = Number(data.rating)
  if (!Number.isInteger(rating) || rating < 0) {
    throw new Error(
      'Рейтинг должен быть целым числом от 0.\n' +
        'Удалите знаки препинания и буквы, введите целое неотрицательное число.'
    )
  }

  if (!data.inn || !/^\d{10}$|^\d{12}$/.test(data.inn.trim())) {
    throw new Error(
      'ИНН должен содержать 10 или 12 цифр.\n' +
        'Проверьте количество цифр и отсутствие букв, затем повторите попытку.'
    )
  }
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
  try {
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
  } catch (err) {
    logError('getPartnersWithDiscount: не удалось загрузить список партнёров', err)
    throw err
  }
}

export async function getPartnerById(id: number): Promise<PartnerWithDiscount | null> {
  try {
    const { rows } = await pool.query(
      `SELECT partner_id, company_name, partner_type, inn,
              address, director_name, contact_email, phone, rating
       FROM partners WHERE partner_id = $1`,
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
      total_quantity: 0,
      discount_percent: 0
    }
  } catch (err) {
    logError(`getPartnerById: ошибка загрузки партнёра id=${id}`, err)
    throw err
  }
}

export async function createPartner(data: PartnerInput): Promise<number> {
  try {
    validatePartnerInput(data)

    const { rows } = await pool.query(
      `INSERT INTO partners
         (company_name, partner_type, inn, address, director_name,
          contact_email, phone, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING partner_id`,
      [
        data.company_name.trim(),
        data.partner_type,
        data.inn.trim(),
        data.address?.trim() || null,
        data.director_name?.trim() || null,
        data.contact_email?.trim() || null,
        data.phone?.trim() || null,
        data.rating
      ]
    )
    return Number(rows[0].partner_id)
  } catch (err) {
    logError(`createPartner: не удалось создать партнёра "${data.company_name}"`, err)
    throw err
  }
}

export async function updatePartner(id: number, data: PartnerInput): Promise<void> {
  try {
    validatePartnerInput(data)

    const result = await pool.query(
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
        data.company_name.trim(),
        data.partner_type,
        data.inn.trim(),
        data.address?.trim() || null,
        data.director_name?.trim() || null,
        data.contact_email?.trim() || null,
        data.phone?.trim() || null,
        data.rating,
        id
      ]
    )

    if (result.rowCount === 0) {
      throw new Error('Партнёр не найден в базе данных.')
    }
  } catch (err) {
    logError(`updatePartner: не удалось обновить партнёра id=${id}`, err)
    throw err
  }
}

const HISTORY_SQL = `
  SELECT
      s.sale_id,
      pr.product_name,
      s.quantity,
      s.sale_date,
      s.total_amount,
      s.unit_price
  FROM sales_history s
  INNER JOIN products pr ON pr.product_id = s.product_id
  INNER JOIN partners p  ON p.partner_id  = s.partner_id
  WHERE s.partner_id = $1
  ORDER BY s.sale_date DESC, s.sale_id DESC;
`

export async function getPartnerHistory(partnerId: number): Promise<SaleRecord[]> {
  try {
    const { rows } = await pool.query(HISTORY_SQL, [partnerId])

    return rows.map((row) => ({
      sale_id: Number(row.sale_id),
      product_name: String(row.product_name ?? ''),
      quantity: Number(row.quantity) || 0,
      // Дату приводим к ISO — форматирование делает рендерер
      sale_date:
        row.sale_date instanceof Date
          ? row.sale_date.toISOString().slice(0, 10)
          : String(row.sale_date),
      total_amount: Number(row.total_amount) || 0,
      unit_price: Number(row.unit_price) || 0
    }))
  } catch (err) {
    logError(`getPartnerHistory: ошибка для партнёра id=${partnerId}`, err)
    throw err
  }
}
