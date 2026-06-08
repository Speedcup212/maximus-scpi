import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { prelevementsSociauxScpiConfig } from './scpiEducational/prelevementsSociauxScpiContent'

interface PrelevementsSociauxScpiPageProps {
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const PrelevementsSociauxScpiPage: React.FC<PrelevementsSociauxScpiPageProps> = (props) => (
  <ScpiEducationalPageLayout config={prelevementsSociauxScpiConfig} {...props} />
)

export default PrelevementsSociauxScpiPage
