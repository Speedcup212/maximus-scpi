import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { cgpCifScpiConfig } from './scpiEducational/cgpCifScpiContent'

const CgpCifScpiPage: React.FC<{
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}> = ({ onNavigate, onComparateurClick }) => {
  return (
    <ScpiEducationalPageLayout
      config={cgpCifScpiConfig}
      onNavigate={onNavigate}
      onComparateurClick={onComparateurClick}
    />
  )
}

export default CgpCifScpiPage
