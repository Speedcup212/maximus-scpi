import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { scpiInvestirEnCoupleContent } from './scpiEducational/scpiInvestirEnCoupleContent'

const ScpiInvestirEnCouplePage: React.FC<{
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}> = ({ onNavigate, onComparateurClick }) => {
  return (
    <ScpiEducationalPageLayout
      config={scpiInvestirEnCoupleContent}
      onNavigate={onNavigate}
      onComparateurClick={onComparateurClick}
    />
  )
}

export default ScpiInvestirEnCouplePage
