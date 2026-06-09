import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { scpiRetraiteConfig } from './scpiEducational/scpiRetraiteContent'

const ScpiRetraitePage: React.FC = () => {
  return <ScpiEducationalPageLayout config={scpiRetraiteConfig} />
}

export default ScpiRetraitePage
