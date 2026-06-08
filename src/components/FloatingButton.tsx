import React from 'react';
import { Calendar } from 'lucide-react';
import { CALENDLY_URL } from '../config/calendly';

interface FloatingButtonProps {
  isVisible: boolean;
  // Conservé pour compat : le bouton ouvre désormais Calendly directement.
  onClick?: () => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ isVisible }) => {
  return (
    <a
      href={CALENDLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`hidden md:flex fixed bottom-6 right-6 z-40 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 hover:shadow-xl hover:scale-105 transition-all duration-300 items-center justify-center ${
        isVisible
          ? 'translate-y-0 opacity-100 visible'
          : 'translate-y-16 opacity-0 invisible'
      }`}
      aria-label="Prendre rendez-vous avec un expert"
    >
      <Calendar className="w-6 h-6" />
    </a>
  );
};

export default FloatingButton;