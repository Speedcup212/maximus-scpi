import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { endettementScpiConfig } from './scpiEducational/endettementScpiContent'

interface EndettementScpiPageProps {
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const EndettementScpiPage: React.FC<EndettementScpiPageProps> = (props) => (
  <ScpiEducationalPageLayout config={endettementScpiConfig} {...props} />
)

export default EndettementScpiPage
