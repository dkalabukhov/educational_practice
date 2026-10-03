import { describe, it, expect, vi, beforeEach } from 'vitest'

// Мокаем модуль БД ДО импорта сервиса
vi.mock('../src/main/db', () => ({
  pool: {
    query: vi.fn()
  }
}))

// Мокаем логгер, чтобы тесты не писали в app.log
vi.mock('../src/main/logger', () => ({
  logError: vi.fn(),
  getLogPath: vi.fn(() => '/tmp/app.log')
}))

import { pool } from '../src/main/db'
import { calculateRawMaterial } from '../src/main/rawMaterialService'

const mockQuery = pool.query as unknown as ReturnType<typeof vi.fn>

// Справочники, которые будет возвращать мок БД
const PRODUCT_TYPES: Record<number, number> = {
  1: 1.0,
  2: 1.25,
  3: 1.5
}

const MATERIAL_TYPES: Record<number, number> = {
  1: 5.0,
  2: 8.0,
  3: 12.0
}

beforeEach(() => {
  mockQuery.mockReset()
  mockQuery.mockImplementation((sql: string, params: unknown[]) => {
    const id = Array.isArray(params) ? Number(params[0]) : 0

    if (sql.includes('FROM product_types')) {
      const coefficient = PRODUCT_TYPES[id]
      return Promise.resolve({
        rows: coefficient === undefined ? [] : [{ coefficient }]
      })
    }

    if (sql.includes('FROM material_types')) {
      const defect_percent = MATERIAL_TYPES[id]
      return Promise.resolve({
        rows: defect_percent === undefined ? [] : [{ defect_percent }]
      })
    }

    return Promise.resolve({ rows: [] })
  })
})

describe('calculateRawMaterial', () => {
  // Тест 1: стандартный корректный расчёт
  it('возвращает корректный результат для валидных параметров', async () => {
    // product_type 2 → коэф. 1.25
    // material_type 1 → брак 5%
    // quantity 100, param1 2.5, param2 4.0
    // base = 2.5 * 4.0 * 1.25 = 12.5
    // net = 12.5 * 100 = 1250
    // with defect = 1250 * 1.05 = 1312.5
    // ceil = 1313
    const result = await calculateRawMaterial(2, 1, 100, 2.5, 4.0)

    expect(result.value).toBe(1313)
    expect(result.error).toBeNull()
  })

  // Тест 2: округление дробного результата строго вверх
  it('округляет результат вверх до целого числа', async () => {
    // product_type 1 → коэф. 1.0
    // material_type 1 → брак 5%
    // quantity 1, param1 1.0, param2 1.0
    // base = 1.0 * 1.0 * 1.0 = 1.0
    // net = 1.0
    // with defect = 1.05
    // ceil = 2  (а не 1)
    const result = await calculateRawMaterial(1, 1, 1, 1.0, 1.0)

    expect(result.value).toBe(2)
    expect(result.error).toBeNull()
  })

  it('округляет вверх даже для 1.01', async () => {
    // product_type 1 → коэф. 1.0
    // material_type 1 → брак 5%
    // quantity 1, param1 1.0, param2 0.962
    // base = 0.962
    // net = 0.962
    // with defect = 1.0101
    // ceil = 2
    const result = await calculateRawMaterial(1, 1, 1, 1.0, 0.962)

    expect(result.value).toBe(2)
  })

  // Тест 3: несуществующий тип продукции / материала
  it('возвращает -1 при несуществующем product_type_id', async () => {
    const result = await calculateRawMaterial(999, 1, 100, 2.5, 4.0)

    expect(result.value).toBe(-1)
    expect(result.error).toContain('Тип продукции')
  })

  it('возвращает -1 при несуществующем material_type_id', async () => {
    const result = await calculateRawMaterial(1, 999, 100, 2.5, 4.0)

    expect(result.value).toBe(-1)
    expect(result.error).toContain('Тип материала')
  })

  // Тест 4: отрицательные параметры продукции
  it('возвращает -1 при отрицательном param1', async () => {
    const result = await calculateRawMaterial(1, 1, 100, -2.5, 4.0)

    expect(result.value).toBe(-1)
    expect(result.error).toContain('Параметр 1')
  })

  it('возвращает -1 при отрицательном param2', async () => {
    const result = await calculateRawMaterial(1, 1, 100, 2.5, -4.0)

    expect(result.value).toBe(-1)
    expect(result.error).toContain('Параметр 2')
  })

  it('возвращает -1 при нулевом param1', async () => {
    const result = await calculateRawMaterial(1, 1, 100, 0, 4.0)

    expect(result.value).toBe(-1)
    expect(result.error).toContain('Параметр 1')
  })

  // Тест 5: нулевое или отрицательное количество
  it('возвращает -1 при quantity = 0', async () => {
    const result = await calculateRawMaterial(1, 1, 0, 2.5, 4.0)

    expect(result.value).toBe(-1)
    expect(result.error).toContain('Количество')
  })

  it('возвращает -1 при отрицательном quantity', async () => {
    const result = await calculateRawMaterial(1, 1, -5, 2.5, 4.0)

    expect(result.value).toBe(-1)
    expect(result.error).toContain('Количество')
  })

  // Дополнительно: NaN, Infinity, дробное quantity
  it('возвращает -1 при NaN в параметрах', async () => {
    const result = await calculateRawMaterial(1, 1, 100, NaN, 4.0)

    expect(result.value).toBe(-1)
  })

  it('возвращает -1 при Infinity в параметрах', async () => {
    const result = await calculateRawMaterial(1, 1, 100, Infinity, 4.0)

    expect(result.value).toBe(-1)
  })

  it('возвращает -1 при дробном quantity', async () => {
    const result = await calculateRawMaterial(1, 1, 1.5, 2.5, 4.0)

    expect(result.value).toBe(-1)
  })

  // Проверка поведения при ошибке БД
  it('возвращает -1 при ошибке БД', async () => {
    mockQuery.mockImplementation(() => Promise.reject(new Error('Connection lost')))

    const result = await calculateRawMaterial(1, 1, 100, 2.5, 4.0)

    expect(result.value).toBe(-1)
    expect(result.error).toContain('базы данных')
  })
})
