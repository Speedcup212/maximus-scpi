import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { fraisScpiConfig } from './scpiEducational/fraisScpiContent'

interface FraisScpiPageProps {
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const FraisScpiPage: React.FC<FraisScpiPageProps> = (props) => (
  <ScpiEducationalPageLayout config={fraisScpiConfig} {...props} />
)

export default FraisScpiPage
