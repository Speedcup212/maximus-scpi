import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { scpiHotellerieTourismeContent } from './scpiEducational/scpiHotellerieTourismeContent'

const ScpiHotellerieTourismePage: React.FC<{
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}> = ({ onNavigate, onComparateurClick }) => {
  return (
    <ScpiEducationalPageLayout
      config={scpiHotellerieTourismeContent}
      onNavigate={onNavigate}
      onComparateurClick={onComparateurClick}
    />
  )
}

export default ScpiHotellerieTourismePage
