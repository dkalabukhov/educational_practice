import type { Partner } from './types'

declare global {
  interface Window {
    electronAPI: {
      getPartners: () => Promise<Partner[]>
    }
  }
}

export {}
