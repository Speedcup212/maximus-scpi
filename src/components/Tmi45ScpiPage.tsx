import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { tmi45ScpiConfig } from './scpiEducational/tmi45ScpiContent'

interface Tmi45ScpiPageProps {
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const Tmi45ScpiPage: React.FC<Tmi45ScpiPageProps> = (props) => (
  <ScpiEducationalPageLayout config={tmi45ScpiConfig} {...props} />
)

export default Tmi45ScpiPage
