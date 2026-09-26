import { JSX } from 'react/jsx-runtime'

export default function App(): JSX.Element {
  return (
    <div className="edit-window">
      <h2 className="edit-window__title">Карточка партнера</h2>

      <p className="edit-window__hint">Форма находится в разработке.</p>

      <div className="edit-window__actions">
        <button className="btn" onClick={() => window.electronAPI.closeCurrentWindow()}>
          Назад
        </button>
      </div>
    </div>
  )
}
