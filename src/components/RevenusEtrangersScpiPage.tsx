import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { revenusEtrangersScpiConfig } from './scpiEducational/revenusEtrangersScpiContent'

interface RevenusEtrangersScpiPageProps {
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const RevenusEtrangersScpiPage: React.FC<RevenusEtrangersScpiPageProps> = (props) => (
  <ScpiEducationalPageLayout config={revenusEtrangersScpiConfig} {...props} />
)

export default RevenusEtrangersScpiPage
