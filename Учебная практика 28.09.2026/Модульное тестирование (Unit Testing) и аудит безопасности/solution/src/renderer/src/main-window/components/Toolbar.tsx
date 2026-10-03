import { JSX } from 'react'

interface ToolbarProps {
  onAdd: () => void
  onRefresh: () => void
  onOpenHistory: () => void
  onOpenCalculator: () => void
  historyDisabled: boolean
}

export default function Toolbar({
  onAdd,
  onRefresh,
  onOpenHistory,
  onOpenCalculator,
  historyDisabled
}: ToolbarProps): JSX.Element {
  return (
    <div className="toolbar">
      <button className="btn btn--primary" onClick={onAdd}>
        Добавить партнера
      </button>
      <button className="btn" onClick={onRefresh}>
        Обновить
      </button>
      <button className="btn" onClick={onOpenHistory} disabled={historyDisabled}>
        История продаж
      </button>
      <button className="btn" onClick={onOpenCalculator}>
        Калькулятор сырья
      </button>
    </div>
  )
}
