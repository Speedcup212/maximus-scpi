import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { tmi41ScpiConfig } from './scpiEducational/tmi41ScpiContent'

interface Tmi41ScpiPageProps {
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const Tmi41ScpiPage: React.FC<Tmi41ScpiPageProps> = (props) => (
  <ScpiEducationalPageLayout config={tmi41ScpiConfig} {...props} />
)

export default Tmi41ScpiPage
