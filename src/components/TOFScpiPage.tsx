import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { tofScpiConfig } from './scpiEducational/tofScpiContent'

interface TOFScpiPageProps {
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const TOFScpiPage: React.FC<TOFScpiPageProps> = ({ onNavigate, onComparateurClick }) => {
  return (
    <ScpiEducationalPageLayout
      config={tofScpiConfig}
      onNavigate={onNavigate}
      onComparateurClick={onComparateurClick}
    />
  )
}

export default TOFScpiPage
