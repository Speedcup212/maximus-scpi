import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { psiScpiConfig } from './scpiEducational/psiScpiContent'

const PsiScpiPage: React.FC<{
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}> = ({ onNavigate, onComparateurClick }) => {
  return (
    <ScpiEducationalPageLayout
      config={psiScpiConfig}
      onNavigate={onNavigate}
      onComparateurClick={onComparateurClick}
    />
  )
}

export default PsiScpiPage
