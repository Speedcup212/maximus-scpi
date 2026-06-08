import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { demembrementScpiConfig } from './scpiEducational/demembrementScpiContent'

interface DemembrementScpiPageProps {
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const DemembrementScpiPage: React.FC<DemembrementScpiPageProps> = (props) => (
  <ScpiEducationalPageLayout config={demembrementScpiConfig} {...props} />
)

export default DemembrementScpiPage
