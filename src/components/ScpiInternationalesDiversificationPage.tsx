import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { scpiInternationalesDiversificationContent } from './scpiEducational/scpiInternationalesDiversificationContent'

const ScpiInternationalesDiversificationPage: React.FC<{
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}> = ({ onNavigate, onComparateurClick }) => {
  return (
    <ScpiEducationalPageLayout
      config={scpiInternationalesDiversificationContent}
      onNavigate={onNavigate}
      onComparateurClick={onComparateurClick}
    />
  )
}

export default ScpiInternationalesDiversificationPage
