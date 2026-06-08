import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { reportANouveauScpiConfig } from './scpiEducational/reportANouveauScpiContent'

const ReportANouveauScpiPage: React.FC<{
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}> = ({ onNavigate, onComparateurClick }) => {
  return (
    <ScpiEducationalPageLayout
      config={reportANouveauScpiConfig}
      onNavigate={onNavigate}
      onComparateurClick={onComparateurClick}
    />
  )
}

export default ReportANouveauScpiPage
