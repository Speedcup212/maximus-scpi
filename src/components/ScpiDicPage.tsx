import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { dicScpiConfig } from './scpiEducational/dicScpiContent'

const ScpiDicPage: React.FC = () => {
  return <ScpiEducationalPageLayout config={dicScpiConfig} />
}

export default ScpiDicPage
