import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { liquiditeScpiConfig } from './scpiEducational/liquiditeScpiContent'

const LiquiditeScpiPage: React.FC<{
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}> = ({ onNavigate, onComparateurClick }) => {
  return (
    <ScpiEducationalPageLayout
      config={liquiditeScpiConfig}
      onNavigate={onNavigate}
      onComparateurClick={onComparateurClick}
    />
  )
}

export default LiquiditeScpiPage
