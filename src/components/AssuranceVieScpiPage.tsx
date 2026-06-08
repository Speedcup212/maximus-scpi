import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { assuranceVieScpiConfig } from './scpiEducational/assuranceVieScpiContent'

interface AssuranceVieScpiPageProps {
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const AssuranceVieScpiPage: React.FC<AssuranceVieScpiPageProps> = (props) => (
  <ScpiEducationalPageLayout config={assuranceVieScpiConfig} {...props} />
)

export default AssuranceVieScpiPage
