import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { scpiComptantConfig } from './scpiEducational/scpiComptantContent'

const ScpiComptantPage: React.FC = () => {
  return <ScpiEducationalPageLayout config={scpiComptantConfig} />
}

export default ScpiComptantPage
