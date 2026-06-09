import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { scpiTransmissionConfig } from './scpiEducational/scpiTransmissionContent'

const ScpiTransmissionPage: React.FC = () => {
  return <ScpiEducationalPageLayout config={scpiTransmissionConfig} />
}

export default ScpiTransmissionPage
