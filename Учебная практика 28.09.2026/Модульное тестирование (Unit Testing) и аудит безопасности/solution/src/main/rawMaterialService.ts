import { pool } from './db'
import { logError } from './logger'
import type { ProductTypeRef, MaterialTypeRef } from '../shared/types'

/**
 * Расчёт итогового расхода сырья.
 * Возвращает объект: value — число или -1, error — текст ошибки или null.
 */
export async function calculateRawMaterial(
  productTypeId: number,
  materialTypeId: number,
  quantity: number,
  param1: number,
  param2: number
): Promise<{ value: number; error: string | null }> {
  try {
    // --- Валидация входных параметров ---
    if (!Number.isInteger(productTypeId) || productTypeId <= 0) {
      return { value: -1, error: 'Выберите тип продукции из списка.' }
    }
    if (!Number.isInteger(materialTypeId) || materialTypeId <= 0) {
      return { value: -1, error: 'Выберите тип материала из списка.' }
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return { value: -1, error: 'Количество продукции должно быть целым числом больше 0.' }
    }
    if (!Number.isFinite(param1) || param1 <= 0) {
      return { value: -1, error: 'Параметр 1 должен быть положительным числом.' }
    }
    if (!Number.isFinite(param2) || param2 <= 0) {
      return { value: -1, error: 'Параметр 2 должен быть положительным числом.' }
    }

    // --- Коэффициент типа продукции ---
    const productTypeResult = await pool.query(
      `SELECT coefficient FROM product_types WHERE product_type_id = $1`,
      [productTypeId]
    )
    if (productTypeResult.rows.length === 0) {
      return { value: -1, error: `Тип продукции с ID ${productTypeId} не найден в справочнике.` }
    }
    const coefficient = Number(productTypeResult.rows[0].coefficient)
    if (!Number.isFinite(coefficient) || coefficient <= 0) {
      return { value: -1, error: 'Некорректный коэффициент типа продукции в справочнике.' }
    }

    // --- Процент брака материала ---
    const materialTypeResult = await pool.query(
      `SELECT defect_percent FROM material_types WHERE material_type_id = $1`,
      [materialTypeId]
    )
    if (materialTypeResult.rows.length === 0) {
      return { value: -1, error: `Тип материала с ID ${materialTypeId} не найден в справочнике.` }
    }
    const defectPercent = Number(materialTypeResult.rows[0].defect_percent)
    if (!Number.isFinite(defectPercent) || defectPercent < 0) {
      return { value: -1, error: 'Некорректный процент брака в справочнике.' }
    }

    // --- Формулы из ТЗ ---
    const basePerUnit = param1 * param2 * coefficient
    const totalNet = basePerUnit * quantity
    const totalWithDefect = totalNet * (1 + defectPercent / 100)
    const result = Math.ceil(totalWithDefect)

    if (!Number.isFinite(result) || result <= 0) {
      return { value: -1, error: 'Результат расчёта оказался некорректным.' }
    }
    return { value: result, error: null }
  } catch (err) {
    logError(
      `calculateRawMaterial: ошибка при product_type=${productTypeId}, ` +
        `material_type=${materialTypeId}, quantity=${quantity}, ` +
        `param1=${param1}, param2=${param2}`,
      err
    )
    return { value: -1, error: 'Ошибка базы данных. Проверьте подключение и повторите попытку.' }
  }
}

// Справочники для выпадающих списков в UI
export async function getProductTypes(): Promise<ProductTypeRef[]> {
  try {
    const { rows } = await pool.query(
      `SELECT product_type_id, name, coefficient FROM product_types ORDER BY product_type_id`
    )
    return rows.map((row) => ({
      product_type_id: Number(row.product_type_id),
      name: String(row.name ?? ''),
      coefficient: Number(row.coefficient) || 0
    }))
  } catch (err) {
    logError('getProductTypes: не удалось загрузить справочник типов продукции', err)
    throw err
  }
}

export async function getMaterialTypes(): Promise<MaterialTypeRef[]> {
  try {
    const { rows } = await pool.query(
      `SELECT material_type_id, name, defect_percent FROM material_types ORDER BY material_type_id`
    )
    return rows.map((row) => ({
      material_type_id: Number(row.material_type_id),
      name: String(row.name ?? ''),
      defect_percent: Number(row.defect_percent) || 0
    }))
  } catch (err) {
    logError('getMaterialTypes: не удалось загрузить справочник типов материалов', err)
    throw err
  }
}
