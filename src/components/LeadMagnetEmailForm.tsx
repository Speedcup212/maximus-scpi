import React, { useState } from 'react';

const LeadMagnetEmailForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [consentement, setConsentement] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consentement) {
      alert('Veuillez accepter de recevoir nos communications par email.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { supabase } = await import('../supabaseClient');

      // 1️⃣ Appeler l'edge function Sender directement
      console.log('🚀 Appel Sender en cours...');
      const { data: senderData, error: senderError } = await supabase.functions.invoke('sender-add-contact', {
        body: {
          email,
          firstname: prenom,
          lastname: nom,
          group_id: 'LM_SCPI_SansFrais',
          fields: {
            source: 'Lead Magnet - Guide Comparatif',
            date_telechargement: new Date().toISOString()
          }
        }
      });

      if (senderError) {
        console.error('❌ Erreur Sender:', senderError);
        console.error('Détails:', JSON.stringify(senderError, null, 2));
      } else {
        console.log('✅ Contact ajouté à Sender:', senderData);
      }

      // 2️⃣ Sauvegarder dans Supabase
      const { error } = await supabase
        .from('leads_pdf_comparatif')
        .insert([{
          email,
          prenom,
          nom,
          source_page: 'Guide Comparatif Iroko Zen vs Novaxia Neo',
          consentement_marketing: true,
          consentement_date: new Date().toISOString(),
          source: 'Lead Magnet - Guide Comparatif'
        }]);

      if (error) {
        console.error('Erreur Supabase:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
        setIsSubmitting(false);
        return;
      }

      if (window.gtag) {
        window.gtag('event', 'generate_lead', {
          'event_category': 'Lead Magnet',
          'event_label': 'Guide PDF Iroko vs Novaxia'
        });
      }

      // 📧 Stocker l'email pour la page de remerciement
      localStorage.setItem('lead_email', email);

      window.location.href = `/merci-guide-comparatif.html?email=${encodeURIComponent(email)}`;
    } catch (error) {
      console.error('Erreur capture lead:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">

      <h1 className="text-3xl font-bold mb-3 text-center leading-tight">
        <span className="block text-emerald-700">SCPI sans frais</span>
        <span className="block text-gray-900">Iroko Zen vs Novaxia Neo :</span>
        <span className="block text-gray-900">le comparatif qui tranche</span>
      </h1>

      <h3 className="text-lg text-gray-700 mb-6 text-center font-medium">
        Analyse chiffrée et opérationnelle des deux SCPI sans frais d'entrée
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
            Prénom *
          </label>
          <input
            type="text"
            id="prenom"
            name="prenom"
            required
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            placeholder="Votre prénom"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
            Nom *
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Votre nom"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            E-mail *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre adresse e-mail"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
          />
        </div>

        <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="consentement"
            name="consentement"
            required
            checked={consentement}
            onChange={(e) => setConsentement(e.target.checked)}
            className="mt-1 h-5 w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
          />
          <label htmlFor="consentement" className="text-sm text-gray-700 leading-relaxed">
            J'accepte de recevoir des conseils et informations sur l'investissement SCPI par email.
            Je peux me désabonner à tout moment via le lien présent dans chaque email. *
            <a href="/conditions-utilisation" target="_blank" className="text-emerald-600 hover:text-emerald-700 underline ml-1">
              En savoir plus
            </a>
          </label>
        </div>

        <p className="text-xs text-gray-500 text-center">
          * Champs obligatoires
        </p>

        <button
          type="submit"
          disabled={isSubmitting || !consentement}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Envoi en cours...' : 'Recevoir le Guide PDF'}
        </button>
      </form>
    </div>
  );
};

export default LeadMagnetEmailForm;
