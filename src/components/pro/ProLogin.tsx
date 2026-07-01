import ProfessionalPortal from '../expert/ProfessionalPortal';

interface ProLoginProps {
  onNavigate: (path: string) => void;
}

export default function ProLogin({ onNavigate: _onNavigate }: ProLoginProps) {
  return <ProfessionalPortal />;
}
