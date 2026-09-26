import type { Partner } from './types'

declare global {
  interface Window {
    electronAPI: {
      openMainWindow: () => Promise<void>
      openPartnerEdit: () => Promise<void>
      closeCurrentWindow: () => Promise<void>
      getPartners: () => Promise<Partner[]>
    }
  }
}

export {}
