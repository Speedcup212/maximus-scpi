import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { documentsReglementairesScpiConfig } from './scpiEducational/documentsReglementairesScpiContent'

const ScpiDocumentsReglementairesPage: React.FC = () => {
  return <ScpiEducationalPageLayout config={documentsReglementairesScpiConfig} />
}

export default ScpiDocumentsReglementairesPage
