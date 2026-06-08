import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { allocationScpiConfig } from './scpiEducational/allocationScpiContent'

const AllocationScpiPage: React.FC<{
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}> = ({ onNavigate, onComparateurClick }) => {
  return (
    <ScpiEducationalPageLayout
      config={allocationScpiConfig}
      onNavigate={onNavigate}
      onComparateurClick={onComparateurClick}
    />
  )
}

export default AllocationScpiPage
