import { useEffect, useState, JSX } from 'react'
import type { ProductTypeRef, MaterialTypeRef } from '../shared/types'

export default function App(): JSX.Element {
  const [productTypes, setProductTypes] = useState<ProductTypeRef[]>([])
  const [materialTypes, setMaterialTypes] = useState<MaterialTypeRef[]>([])
  const [refsLoading, setRefsLoading] = useState(true)

  const [productTypeId, setProductTypeId] = useState<number | ''>('')
  const [materialTypeId, setMaterialTypeId] = useState<number | ''>('')
  const [quantity, setQuantity] = useState<string>('')
  const [param1, setParam1] = useState<string>('')
  const [param2, setParam2] = useState<string>('')

  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState<string>('')
  const [calculating, setCalculating] = useState(false)

  // Загружаем справочники один раз при монтировании
  useEffect(() => {
    let ignore = false

    const load = async (): Promise<void> => {
      try {
        const [products, materials] = await Promise.all([
          window.electronAPI.getProductTypes(),
          window.electronAPI.getMaterialTypes()
        ])
        if (ignore) return
        setProductTypes(products)
        setMaterialTypes(materials)
      } catch (err) {
        if (ignore) return
        console.log(err)
        setError('Не удалось загрузить справочники. Проверьте подключение к БД.')
      } finally {
        if (!ignore) setRefsLoading(false)
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [])

  const handleCalculate = async (): Promise<void> => {
    setError('')
    setResult(null)

    // Проверяем, что всё заполнено
    if (productTypeId === '') {
      setError('Выберите тип продукции.')
      return
    }
    if (materialTypeId === '') {
      setError('Выберите тип материала.')
      return
    }
    if (quantity.trim() === '') {
      setError('Укажите количество продукции.')
      return
    }
    if (param1.trim() === '') {
      setError('Укажите параметр 1.')
      return
    }
    if (param2.trim() === '') {
      setError('Укажите параметр 2.')
      return
    }

    const quantityNum = Number(quantity)
    const param1Num = Number(param1)
    const param2Num = Number(param2)

    setCalculating(true)
    try {
      const response = await window.electronAPI.calculateRawMaterial(
        productTypeId,
        materialTypeId,
        quantityNum,
        param1Num,
        param2Num
      )

      if (response.error) {
        // Метод вернул -1 с пояснением — показываем пользователю
        setError(response.error)
      } else if (response.value === -1) {
        // Страховка на случай, если пришло -1 без текста
        setError('Расчёт невозможен. Проверьте введённые данные.')
      } else {
        setResult(response.value)
      }
    } catch (err) {
      console.log(err)
      setError('Непредвиденная ошибка. Попробуйте ещё раз.')
    } finally {
      setCalculating(false)
    }
  }

  const handleReset = (): void => {
    setProductTypeId('')
    setMaterialTypeId('')
    setQuantity('')
    setParam1('')
    setParam2('')
    setResult(null)
    setError('')
  }

  if (refsLoading) {
    return <div className="state">Загрузка справочников…</div>
  }

  return (
    <div className="calculator">
      <h2 className="calculator__title">Калькулятор расхода сырья</h2>

      <label className="field">
        <span className="field__label">Тип продукции</span>
        <select
          value={productTypeId}
          onChange={(e) => setProductTypeId(e.target.value === '' ? '' : Number(e.target.value))}
        >
          <option value="">— выберите —</option>
          {productTypes.map((pt) => (
            <option key={pt.product_type_id} value={pt.product_type_id}>
              {pt.name} (коэф. {pt.coefficient})
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field__label">Тип материала</span>
        <select
          value={materialTypeId}
          onChange={(e) => setMaterialTypeId(e.target.value === '' ? '' : Number(e.target.value))}
        >
          <option value="">— выберите —</option>
          {materialTypes.map((mt) => (
            <option key={mt.material_type_id} value={mt.material_type_id}>
              {mt.name} (брак {mt.defect_percent}%)
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field__label">Количество продукции (шт.)</span>
        <input
          type="number"
          min={1}
          step={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="100"
        />
      </label>

      <label className="field">
        <span className="field__label">Параметр 1</span>
        <input
          type="number"
          step="any"
          value={param1}
          onChange={(e) => setParam1(e.target.value)}
          placeholder="2.5"
        />
      </label>

      <label className="field">
        <span className="field__label">Параметр 2</span>
        <input
          type="number"
          step="any"
          value={param2}
          onChange={(e) => setParam2(e.target.value)}
          placeholder="4.0"
        />
      </label>

      <div className="calculator__actions">
        <button className="btn btn--primary" onClick={handleCalculate} disabled={calculating}>
          {calculating ? 'Расчёт…' : 'Рассчитать'}
        </button>
        <button className="btn" onClick={handleReset}>
          Сбросить
        </button>
        <button className="btn" onClick={() => window.electronAPI.closeCurrentWindow()}>
          Закрыть
        </button>
      </div>

      {error && <div className="result result--error">{error}</div>}

      {result !== null && (
        <div className="result result--ok">
          Итоговый расход сырья: <strong>{result}</strong> ед.
        </div>
      )}
    </div>
  )
}
