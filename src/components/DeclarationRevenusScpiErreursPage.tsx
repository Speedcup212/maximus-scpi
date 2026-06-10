import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { declarationRevenusScpiErreursConfig } from './scpiEducational/declarationRevenusScpiErreursContent'

const DeclarationRevenusScpiErreursPage: React.FC<{
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}> = ({ onNavigate, onComparateurClick }) => {
  return (
    <ScpiEducationalPageLayout
      config={declarationRevenusScpiErreursConfig}
      onNavigate={onNavigate}
      onComparateurClick={onComparateurClick}
    />
  )
}

export default DeclarationRevenusScpiErreursPage
