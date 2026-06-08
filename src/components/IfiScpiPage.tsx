import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { ifiScpiConfig } from './scpiEducational/ifiScpiContent'

interface IfiScpiPageProps {
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const IfiScpiPage: React.FC<IfiScpiPageProps> = (props) => (
  <ScpiEducationalPageLayout config={ifiScpiConfig} {...props} />
)

export default IfiScpiPage
