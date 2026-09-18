import { JSX } from 'react/jsx-runtime'
import logoUrl from '@resources/logo.png'

export default function Header(): JSX.Element {
  return (
    <header className="app-header">
      <img src={logoUrl} alt="Логотип компании" className="app-logo" />
      <h1 className="app-title">CRM: Список партнеров и скидок</h1>
    </header>
  )
}
