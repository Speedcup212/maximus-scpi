import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { capitalisationScpiConfig } from './scpiEducational/capitalisationScpiContent'

interface CapitalisationScpiPageProps {
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const CapitalisationScpiPage: React.FC<CapitalisationScpiPageProps> = (props) => (
  <ScpiEducationalPageLayout config={capitalisationScpiConfig} {...props} />
)

export default CapitalisationScpiPage
