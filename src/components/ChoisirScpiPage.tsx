import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { choisirScpiConfig } from './scpiEducational/choisirScpiContent'

const ChoisirScpiPage: React.FC<{
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}> = ({ onNavigate, onComparateurClick }) => {
  return (
    <ScpiEducationalPageLayout
      config={choisirScpiConfig}
      onNavigate={onNavigate}
      onComparateurClick={onComparateurClick}
    />
  )
}

export default ChoisirScpiPage
