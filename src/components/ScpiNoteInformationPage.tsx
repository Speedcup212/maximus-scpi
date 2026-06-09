import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { noteInformationScpiConfig } from './scpiEducational/noteInformationScpiContent'

const ScpiNoteInformationPage: React.FC = () => {
  return <ScpiEducationalPageLayout config={noteInformationScpiConfig} />
}

export default ScpiNoteInformationPage
