import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { scpiEuropeennesConfig } from './scpiEducational/scpiEuropeennesContent'

interface ScpiEuropeennesPageProps {
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const ScpiEuropeennesPage: React.FC<ScpiEuropeennesPageProps> = (props) => (
  <ScpiEducationalPageLayout config={scpiEuropeennesConfig} {...props} />
)

export default ScpiEuropeennesPage
