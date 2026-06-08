import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { tmi30ScpiConfig } from './scpiEducational/tmi30ScpiContent'

interface Tmi30ScpiPageProps {
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const Tmi30ScpiPage: React.FC<Tmi30ScpiPageProps> = (props) => (
  <ScpiEducationalPageLayout config={tmi30ScpiConfig} {...props} />
)

export default Tmi30ScpiPage
