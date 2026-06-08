import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { meilleuresScpiAttentionConfig } from './scpiEducational/meilleuresScpiAttentionContent'

const MeilleuresScpiAttentionPage: React.FC<{
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}> = ({ onNavigate, onComparateurClick }) => {
  return (
    <ScpiEducationalPageLayout
      config={meilleuresScpiAttentionConfig}
      onNavigate={onNavigate}
      onComparateurClick={onComparateurClick}
    />
  )
}

export default MeilleuresScpiAttentionPage
