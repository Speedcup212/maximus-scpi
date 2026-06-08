import React from 'react'
import ScpiEducationalPageLayout from './ScpiEducationalPageLayout'
import { tauxEffectifScpiConfig } from './scpiEducational/tauxEffectifScpiContent'

interface TauxEffectifScpiPageProps {
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const TauxEffectifScpiPage: React.FC<TauxEffectifScpiPageProps> = (props) => (
  <ScpiEducationalPageLayout config={tauxEffectifScpiConfig} {...props} />
)

export default TauxEffectifScpiPage
