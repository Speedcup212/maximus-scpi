import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { fiscaliteAvanceeScpiConfig } from './scpiEducational/fiscaliteAvanceeScpiContent'

interface FiscaliteAvanceeScpiPageProps {
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const FiscaliteAvanceeScpiPage: React.FC<FiscaliteAvanceeScpiPageProps> = (props) => (
  <ScpiEducationalPageLayout config={fiscaliteAvanceeScpiConfig} {...props} />
)

export default FiscaliteAvanceeScpiPage
