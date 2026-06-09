import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { amfScpiConfig } from './scpiEducational/amfScpiContent'

const ScpiAmfPage: React.FC = () => {
  return <ScpiEducationalPageLayout config={amfScpiConfig} />
}

export default ScpiAmfPage
