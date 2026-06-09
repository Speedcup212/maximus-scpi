import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { gestionnaireScpiConfig } from './scpiEducational/gestionnaireScpiContent'

const GestionnaireScpiPage: React.FC<{
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}> = ({ onNavigate, onComparateurClick }) => {
  return (
    <ScpiEducationalPageLayout
      config={gestionnaireScpiConfig}
      onNavigate={onNavigate}
      onComparateurClick={onComparateurClick}
    />
  )
}

export default GestionnaireScpiPage
