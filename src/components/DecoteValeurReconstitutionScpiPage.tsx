import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { decoteScpiConfig } from './scpiEducational/decoteScpiContent'

interface DecoteValeurReconstitutionScpiPageProps {
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const DecoteValeurReconstitutionScpiPage: React.FC<DecoteValeurReconstitutionScpiPageProps> = (props) => (
  <ScpiEducationalPageLayout config={decoteScpiConfig} {...props} />
)

export default DecoteValeurReconstitutionScpiPage
