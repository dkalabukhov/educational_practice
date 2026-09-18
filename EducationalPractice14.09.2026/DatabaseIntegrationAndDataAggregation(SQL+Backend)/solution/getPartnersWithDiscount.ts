import { Pool } from 'pg';

import { calculatePartnerDiscount } from '../../DevelopmentOfTheBusinessLogicCore(DiscountCalculation)/solution/calculatePartnerDiscount';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'educational_practice',
  password: '1998',
  port: 5432,
});

export interface PartnerWithDiscount {
  partner_id: number;
  company_name: string;
  inn: string;
  contact_email: string | null;
  phone: string | null;
  rating: string;
  total_quantity: number;
  discount_percent: number;
}

// Функция получения партнёров со скидкой
// Если partnerId не указан, возвращает всех партнёров
// Если partnerId указан, возвращает только этого партнера
export async function getPartnersWithDiscount(
  partnerId?: number,
): Promise<PartnerWithDiscount[]> {
  const sql = `
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
    ${partnerId !== undefined ? 'WHERE p.partner_id = $1' : ''}
    GROUP BY p.partner_id, p.company_name, p.inn,
             p.contact_email, p.phone, p.rating
    ORDER BY p.partner_id;
  `;

  const params = partnerId !== undefined ? [partnerId] : [];
  const { rows } = await pool.query(sql, params);

  return rows.map((row) => {
    const totalQuantity = Number(row.total_quantity);
    const discountPercent = calculatePartnerDiscount(totalQuantity);
    return {
      partner_id: row.partner_id,
      company_name: row.company_name,
      inn: row.inn,
      contact_email: row.contact_email,
      phone: row.phone,
      rating: row.rating,
      total_quantity: totalQuantity,
      discount_percent: discountPercent,
    };
  });
}

export { pool };