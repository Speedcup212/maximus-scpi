import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { scpiFranceConfig } from './scpiEducational/scpiFranceContent'

const ScpiFrancePage: React.FC = () => {
  return <ScpiEducationalPageLayout config={scpiFranceConfig} />
}

export default ScpiFrancePage
