import { JSX } from 'react'
import Header from './components/Header'
import PartnerCard from './components/PartnerCard'
import { mockPartners as partners } from './data/mockPartners'

export default function App(): JSX.Element {
  return (
    <div className="app">
      <Header />
      <main className="partners-list">
        {partners.length === 0 ? (
          <div className="state">Нет данных о партнёрах</div>
        ) : (
          partners.map((p) => <PartnerCard key={p.partner_id} partner={p} />)
        )}
      </main>
    </div>
  )
}
