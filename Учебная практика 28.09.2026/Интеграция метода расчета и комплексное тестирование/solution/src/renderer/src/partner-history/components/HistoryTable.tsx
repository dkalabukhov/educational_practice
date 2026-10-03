import { JSX } from 'react'
import type { SaleRecord } from '../../shared/types'

interface Props {
  records: SaleRecord[]
}

// Приводим ISO-дату (2026-03-01) к виду 01.03.2026
function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  if (!year || !month || !day) return iso
  return `${day}.${month}.${year}`
}

export default function HistoryTable({ records }: Props): JSX.Element {
  if (records.length === 0) {
    return <div className="state">У партнёра пока нет продаж</div>
  }

  const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0)
  const totalAmount = records.reduce((sum, r) => sum + r.total_amount, 0)

  return (
    <table className="history-table">
      <thead>
        <tr>
          <th>Наименование продукции</th>
          <th className="num">Количество (шт.)</th>
          <th>Дата продажи</th>
          <th className="num">Сумма, ₽</th>
        </tr>
      </thead>
      <tbody>
        {records.map((r) => (
          <tr key={r.sale_id}>
            <td>{r.product_name}</td>
            <td className="num">{r.quantity}</td>
            <td>{formatDate(r.sale_date)}</td>
            <td className="num">{r.total_amount.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td>
            <strong>Итого</strong>
          </td>
          <td className="num">
            <strong>{totalQuantity}</strong>
          </td>
          <td />
          <td className="num">
            <strong>{totalAmount.toFixed(2)}</strong>
          </td>
        </tr>
      </tfoot>
    </table>
  )
}
