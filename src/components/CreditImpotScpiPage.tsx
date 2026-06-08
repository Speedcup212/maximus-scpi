import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { creditImpotScpiConfig } from './scpiEducational/creditImpotScpiContent'

interface CreditImpotScpiPageProps {
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const CreditImpotScpiPage: React.FC<CreditImpotScpiPageProps> = (props) => (
  <ScpiEducationalPageLayout config={creditImpotScpiConfig} {...props} />
)

export default CreditImpotScpiPage
