import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { rendementNetScpiConfig } from './scpiEducational/rendementNetScpiContent'

interface RendementNetScpiPageProps {
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const RendementNetScpiPage: React.FC<RendementNetScpiPageProps> = (props) => (
  <ScpiEducationalPageLayout config={rendementNetScpiConfig} {...props} />
)

export default RendementNetScpiPage
