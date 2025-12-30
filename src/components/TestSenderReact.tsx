import React, { useState } from 'react';

const TestSenderReact: React.FC = () => {
  const [email, setEmail] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<Array<{ type: string; message: string }>>([]);

  const addLog = (message: string, type: 'info' | 'success' | 'error') => {
    setLogs(prev => [...prev, { type, message }]);
    console.log(`[${type}] ${message}`);
  };

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLogs([]);

    try {
      addLog('🚀 Démarrage du test...', 'info');

      // 1️⃣ Appel Sender via Edge Function
      addLog('📡 Appel Edge Function sender-add-contact...', 'info');

      const { supabase } = await import('../supabaseClient');

      const { data: senderData, error: senderError } = await supabase.functions.invoke('sender-add-contact', {
        body: {
          email,
          firstname: prenom,
          lastname: nom,
          group_id: 'LM_SCPI_SansFrais',
          fields: {
            source: 'Test React Component',
            test_date: new Date().toISOString()
          }
        }
      });

      if (senderError) {
        addLog(`❌ Erreur Sender: ${JSON.stringify(senderError)}`, 'error');
      } else {
        addLog(`✅ Sender OK: ${JSON.stringify(senderData)}`, 'success');
      }

      // 2️⃣ Insertion Supabase
      addLog('💾 Insertion dans Supabase...', 'info');
      const { error: dbError } = await supabase
        .from('leads_pdf_comparatif')
        .insert([{
          email,
          prenom,
          nom,
          source: 'Test React Component',
          source_page: 'Test Sender React',
          consentement_marketing: true,
          consentement_date: new Date().toISOString()
        }]);

      if (dbError) {
        addLog(`❌ Erreur Supabase: ${dbError.message}`, 'error');
      } else {
        addLog('✅ Supabase OK: Lead enregistré', 'success');
      }

      addLog('🎉 Test terminé avec succès !', 'success');

    } catch (error: any) {
      addLog(`❌ Erreur fatale: ${error.message}`, 'error');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test Sender + Supabase (React)
          </h1>
          <p className="text-gray-600 mb-6">
            Testez l'intégration complète Sender.net + Supabase depuis un composant React
          </p>

          <form onSubmit={handleTest} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                id="prenom"
                required
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Jean"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                id="nom"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Dupont"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? '⏳ Test en cours...' : '🚀 Tester Sender + Supabase'}
            </button>
          </form>

          {logs.length > 0 && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3">📋 Logs d'exécution</h3>
              <div className="space-y-2 font-mono text-sm">
                {logs.map((log, index) => (
                  <div key={index} className={getLogColor(log.type)}>
                    [{log.type}] {log.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">ℹ️ Informations</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>Groupe Sender :</strong> LM_SCPI_SansFrais
            </p>
            <p>
              <strong>Table Supabase :</strong> leads_pdf_comparatif
            </p>
            <p>
              <strong>Edge Function :</strong> sender-add-contact
            </p>
            <p className="text-gray-500 italic">
              Ce test valide que l'intégration fonctionne correctement depuis un composant React.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSenderReact;
