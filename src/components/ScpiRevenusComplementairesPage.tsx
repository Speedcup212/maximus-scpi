import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { scpiRevenusComplementairesConfig } from './scpiEducational/scpiRevenusComplementairesContent'

const ScpiRevenusComplementairesPage: React.FC = () => {
  return <ScpiEducationalPageLayout config={scpiRevenusComplementairesConfig} />
}

export default ScpiRevenusComplementairesPage
