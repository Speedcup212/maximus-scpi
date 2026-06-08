import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { baissePrixPartScpiConfig } from './scpiEducational/baissePrixPartScpiContent'

const BaissePrixPartScpiPage: React.FC<{
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}> = ({ onNavigate, onComparateurClick }) => {
  return (
    <ScpiEducationalPageLayout
      config={baissePrixPartScpiConfig}
      onNavigate={onNavigate}
      onComparateurClick={onComparateurClick}
    />
  )
}

export default BaissePrixPartScpiPage
