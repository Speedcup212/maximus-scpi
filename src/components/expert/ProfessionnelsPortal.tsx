import React from 'react';
import ProfessionalPortal from './ProfessionalPortal';

interface ProfessionnelsPortalProps {
  onNavigateHome?: () => void;
}

const ProfessionnelsPortal: React.FC<ProfessionnelsPortalProps> = ({ onNavigateHome: _onNavigateHome }) => {
  return <ProfessionalPortal />;
};

export default ProfessionnelsPortal;
