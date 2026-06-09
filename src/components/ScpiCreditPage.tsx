import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { scpiCreditConfig } from './scpiEducational/scpiCreditContent'

const ScpiCreditPage: React.FC = () => {
  return <ScpiEducationalPageLayout config={scpiCreditConfig} />
}

export default ScpiCreditPage
