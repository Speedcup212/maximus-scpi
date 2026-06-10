import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { scpiExpatrieFiscaliteConfig } from './scpiEducational/scpiExpatrieFiscaliteContent'

const ScpiExpatrieFiscalitePage: React.FC<{
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}> = ({ onNavigate, onComparateurClick }) => {
  return (
    <ScpiEducationalPageLayout
      config={scpiExpatrieFiscaliteConfig}
      onNavigate={onNavigate}
      onComparateurClick={onComparateurClick}
    />
  )
}

export default ScpiExpatrieFiscalitePage
