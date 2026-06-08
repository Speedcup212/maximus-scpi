import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { tmi11ScpiConfig } from './scpiEducational/tmi11ScpiContent'

interface Tmi11ScpiPageProps {
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const Tmi11ScpiPage: React.FC<Tmi11ScpiPageProps> = (props) => (
  <ScpiEducationalPageLayout config={tmi11ScpiConfig} {...props} />
)

export default Tmi11ScpiPage
