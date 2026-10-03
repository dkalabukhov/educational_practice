import { pool } from './db'

export async function calculateRawMaterial(
  productTypeId: number,
  materialTypeId: number,
  quantity: number,
  param1: number,
  param2: number
): Promise<number> {
  try {
    // --- 1. Валидация входных параметров ---
    if (!Number.isInteger(productTypeId) || productTypeId <= 0) return -1
    if (!Number.isInteger(materialTypeId) || materialTypeId <= 0) return -1
    if (!Number.isInteger(quantity) || quantity <= 0) return -1
    if (!Number.isFinite(param1) || param1 <= 0) return -1
    if (!Number.isFinite(param2) || param2 <= 0) return -1

    // --- 2. Получение коэффициента типа продукции ---
    const productTypeResult = await pool.query(
      `SELECT coefficient FROM product_types WHERE product_type_id = $1`,
      [productTypeId]
    )
    if (productTypeResult.rows.length === 0) return -1
    const coefficient = Number(productTypeResult.rows[0].coefficient)
    if (!Number.isFinite(coefficient) || coefficient <= 0) return -1

    // --- 3. Получение процента брака материала ---
    const materialTypeResult = await pool.query(
      `SELECT defect_percent FROM material_types WHERE material_type_id = $1`,
      [materialTypeId]
    )
    if (materialTypeResult.rows.length === 0) return -1
    const defectPercent = Number(materialTypeResult.rows[0].defect_percent)
    if (!Number.isFinite(defectPercent) || defectPercent < 0) return -1

    // --- 4. Расчёт ---
    // Базовый расход на 1 ед. = param1 * param2 * coefficient
    const basePerUnit = param1 * param2 * coefficient

    // Общий чистый расход = базовый расход * quantity
    const totalNet = basePerUnit * quantity

    // Итоговый расход с учётом брака = totalNet * (1 + defectPercent / 100)
    const totalWithDefect = totalNet * (1 + defectPercent / 100)

    // Округление вверх до целого
    const result = Math.ceil(totalWithDefect)

    if (!Number.isFinite(result) || result <= 0) return -1
    return result
  } catch (err) {
    // Любая ошибка БД, сети, приведения типов — возвращаем -1
    console.error('[calculateRawMaterial]', err)
    return -1
  }
}

;(async () => {
  const result = await calculateRawMaterial(2, 1, 100, 2.5, 4.0) // 1313
  console.log(result)
})()
