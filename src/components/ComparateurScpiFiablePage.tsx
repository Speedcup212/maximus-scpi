import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { comparateurScpiFiableConfig } from './scpiEducational/comparateurScpiFiableContent'

const ComparateurScpiFiablePage: React.FC<{
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}> = ({ onNavigate, onComparateurClick }) => {
  return (
    <ScpiEducationalPageLayout
      config={comparateurScpiFiableConfig}
      onNavigate={onNavigate}
      onComparateurClick={onComparateurClick}
    />
  )
}

export default ComparateurScpiFiablePage
