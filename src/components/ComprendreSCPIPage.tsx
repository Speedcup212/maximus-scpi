// MaximusSCPI — Page pédagogique SCPI dédiée (route /comprendre-les-scpi)
// Reçoit les sections déplacées depuis la homepage (contenu inchangé) :
// "Comprendre les SCPI", "Comment ça fonctionne", "Types d'actifs immobiliers",
// "Différentes façons d'investir", "Trois grandes familles de SCPI".
// TODO SEO: ajouter <SEOHead> avec meta title/description dédiés à cette page.
// TODO SEO: ajouter un schema.org FAQPage sur les sections clés.
import React from 'react';
import UnderstandingSCPI from './UnderstandingSCPI';

const ComprendreSCPIPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <UnderstandingSCPI />
    </main>
  );
};

export default ComprendreSCPIPage;
