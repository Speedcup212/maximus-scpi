import React from 'react';

const PendingAccess: React.FC = () => {
  return (
    <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6 text-emerald-100">
      <h2 className="text-lg font-semibold">Votre accès est en cours d'activation</h2>
      <p className="mt-2 text-sm text-emerald-200">
        Nous vérifions votre dossier. Vous recevrez une confirmation par email dès l'activation.
      </p>
    </div>
  );
};

export default PendingAccess;
