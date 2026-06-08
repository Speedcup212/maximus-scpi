import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { combienInvestirScpiConfig } from './scpiEducational/combienInvestirScpiContent'

const CombienInvestirScpiPage: React.FC<{
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}> = ({ onNavigate, onComparateurClick }) => {
  return (
    <ScpiEducationalPageLayout
      config={combienInvestirScpiConfig}
      onNavigate={onNavigate}
      onComparateurClick={onComparateurClick}
    />
  )
}

export default CombienInvestirScpiPage
