import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { sciIsFiscaliteScpiConfig } from './scpiEducational/sciIsFiscaliteScpiContent'

interface SciIsFiscaliteScpiPageProps {
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const SciIsFiscaliteScpiPage: React.FC<SciIsFiscaliteScpiPageProps> = (props) => (
  <ScpiEducationalPageLayout config={sciIsFiscaliteScpiConfig} {...props} />
)

export default SciIsFiscaliteScpiPage
