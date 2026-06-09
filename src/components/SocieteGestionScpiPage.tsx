import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { societeGestionScpiConfig } from './scpiEducational/societeGestionScpiContent'

const SocieteGestionScpiPage: React.FC<{
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}> = ({ onNavigate, onComparateurClick }) => {
  return (
    <ScpiEducationalPageLayout
      config={societeGestionScpiConfig}
      onNavigate={onNavigate}
      onComparateurClick={onComparateurClick}
    />
  )
}

export default SocieteGestionScpiPage
