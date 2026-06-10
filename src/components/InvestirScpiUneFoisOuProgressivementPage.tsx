import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { investirScpiUneFoisOuProgressivementContent } from './scpiEducational/investirScpiUneFoisOuProgressivementContent'

const InvestirScpiUneFoisOuProgressivementPage: React.FC<{
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}> = ({ onNavigate, onComparateurClick }) => {
  return (
    <ScpiEducationalPageLayout
      config={investirScpiUneFoisOuProgressivementContent}
      onNavigate={onNavigate}
      onComparateurClick={onComparateurClick}
    />
  )
}

export default InvestirScpiUneFoisOuProgressivementPage
