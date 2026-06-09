import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { oriasScpiConfig } from './scpiEducational/oriasScpiContent'

const ScpiOriasPage: React.FC = () => {
  return <ScpiEducationalPageLayout config={oriasScpiConfig} />
}

export default ScpiOriasPage
