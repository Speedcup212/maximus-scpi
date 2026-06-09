import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { retrocommissionsScpiConfig } from './scpiEducational/retrocommissionsScpiContent'

const RetrocommissionsScpiPage: React.FC<{
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}> = ({ onNavigate, onComparateurClick }) => {
  return (
    <ScpiEducationalPageLayout
      config={retrocommissionsScpiConfig}
      onNavigate={onNavigate}
      onComparateurClick={onComparateurClick}
    />
  )
}

export default RetrocommissionsScpiPage
