import { JSX } from 'react/jsx-runtime'
import PartnerForm from './components/PartnerForm'

export default function App(): JSX.Element {
  return (
    <div className="edit-window">
      <PartnerForm />
    </div>
  )
}
