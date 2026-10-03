import type { PartnerWithDiscount, PartnerInput, SaleRecord } from '@shared/types'

type DialogType = 'error' | 'warning' | 'info'

declare global {
  interface Window {
    electronAPI: {
      openMainWindow: () => Promise<void>
      openPartnerEdit: (partnerId?: number) => Promise<void>
      openPartnerHistory: (partnerId: number, partnerName: string) => Promise<void>
      closeCurrentWindow: () => Promise<void>

      showDialog: (
        type: DialogType,
        title: string,
        message: string,
        detail?: string
      ) => Promise<boolean>

      getPartners: () => Promise<PartnerWithDiscount[]>
      getPartner: (id: number) => Promise<PartnerWithDiscount | null>
      getPartnerHistory: (id: number) => Promise<SaleRecord[]>
      createPartner: (data: PartnerInput) => Promise<number>
      updatePartner: (id: number, data: PartnerInput) => Promise<void>

      onPartnersChanged: (cb: () => void) => () => void
      calculateRawMaterial: (
        productTypeId: number,
        materialTypeId: number,
        quantity: number,
        param1: number,
        param2: number
      ) => Promise<number>
    }
  }
}

export {}
