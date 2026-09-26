import type { Partner, PartnerInput } from './types'

declare global {
  interface Window {
    electronAPI: {
      openMainWindow: () => Promise<void>
      openPartnerEdit: (partnerId?: number) => Promise<void>
      closeCurrentWindow: () => Promise<void>

      getPartners: () => Promise<Partner[]>
      getPartner: (id: number) => Promise<Partner | null>
      createPartner: (data: PartnerInput) => Promise<number>
      updatePartner: (id: number, data: PartnerInput) => Promise<void>

      onPartnersChanged: (cb: () => void) => () => void
    }
  }
}

export {}
