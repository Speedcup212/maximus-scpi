import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { revenusFonciersScpiConfig } from './scpiEducational/revenusFonciersScpiContent'

interface RevenusFonciersScpiPageProps {
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const RevenusFonciersScpiPage: React.FC<RevenusFonciersScpiPageProps> = (props) => (
  <ScpiEducationalPageLayout config={revenusFonciersScpiConfig} {...props} />
)

export default RevenusFonciersScpiPage
