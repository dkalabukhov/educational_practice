import { JSX } from 'react/jsx-runtime'

interface ToolbarProps {
  onAdd: () => void
  onRefresh: () => void
}

export default function Toolbar({ onAdd, onRefresh }: ToolbarProps): JSX.Element {
  return (
    <div className="toolbar">
      <button className="btn btn--primary" onClick={onAdd}>
        Добавить партнера
      </button>
      <button className="btn" onClick={onRefresh}>
        Обновить
      </button>
    </div>
  )
}
