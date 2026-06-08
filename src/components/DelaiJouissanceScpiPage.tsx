import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { delaiJouissanceScpiConfig } from './scpiEducational/delaiJouissanceScpiContent'

const DelaiJouissanceScpiPage: React.FC<{
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}> = ({ onNavigate, onComparateurClick }) => {
  return (
    <ScpiEducationalPageLayout
      config={delaiJouissanceScpiConfig}
      onNavigate={onNavigate}
      onComparateurClick={onComparateurClick}
    />
  )
}

export default DelaiJouissanceScpiPage
