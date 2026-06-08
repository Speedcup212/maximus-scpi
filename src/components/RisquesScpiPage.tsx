import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { risquesScpiConfig } from './scpiEducational/risquesScpiContent'

const RisquesScpiPage: React.FC<{
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}> = ({ onNavigate, onComparateurClick }) => {
  return (
    <ScpiEducationalPageLayout
      config={risquesScpiConfig}
      onNavigate={onNavigate}
      onComparateurClick={onComparateurClick}
    />
  )
}

export default RisquesScpiPage
