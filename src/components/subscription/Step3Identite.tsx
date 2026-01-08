import React from 'react';
import { ArrowLeft, ArrowRight, User, Mail, Phone, MapPin } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { countries } from '../../utils/subscriptionLists';
import { validateEmail, validatePhone, validatePostalCode } from '../../utils/subscriptionValidation';

interface Step3IdentiteProps {
  onClose?: () => void;
}

const Step3Identite: React.FC<Step3IdentiteProps> = ({ onClose }) => {
  const { state, updateState, updateCoSubscriber, goToStep, validateStep } = useSubscription();
  const [hasAttemptedValidation, setHasAttemptedValidation] = React.useState(false);
  
  // S'assurer que coSubscriber est initialisé si subscriptionType est 'biens_communs'
  React.useEffect(() => {
    if (state.subscriptionType === 'biens_communs' && !state.coSubscriber) {
      // Initialiser le co-souscripteur si le type est 'biens_communs' mais qu'il n'existe pas encore
      // On force la mise à jour pour déclencher l'initialisation dans updateState
      updateState({ subscriptionType: 'biens_communs' });
    }
  }, [state.subscriptionType, state.coSubscriber, updateState]);

  const handleContinue = () => {
    setHasAttemptedValidation(true);
    if (!validateStep(3)) {
      return;
    }
    goToStep(4);
  };

  const isStepValid = validateStep(3);
  
  // Fonction helper pour les classes de champs obligatoires
  const getFieldClasses = (isEmpty: boolean) => {
    const baseClasses = "w-full px-4 py-3 bg-slate-700 border-2 rounded-lg text-white focus:outline-none";
    if (hasAttemptedValidation && isEmpty) {
      return `${baseClasses} border-orange-500 focus:border-orange-500`;
    }
    return `${baseClasses} border-slate-600 focus:border-emerald-500`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => goToStep(2)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <User className="w-8 h-8 text-emerald-400" />
            Identité & Contact
          </h1>
        </div>

        {/* Identité & Contact */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            Identité & Contact
          </h2>
          
          {/* Type de souscription */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-300">Type de souscription *</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  state.subscriptionType === 'biens_propres'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="subscriptionType"
                  value="biens_propres"
                  checked={state.subscriptionType === 'biens_propres'}
                  onChange={() => updateState({ subscriptionType: 'biens_propres' })}
                  className="mt-1"
                />
                <div>
                  <span className="text-sm font-medium text-white block">Biens propres</span>
                  <span className="text-xs text-slate-400">Souscription simple</span>
                </div>
              </label>
              
              <label
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  state.subscriptionType === 'biens_communs'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="subscriptionType"
                  value="biens_communs"
                  checked={state.subscriptionType === 'biens_communs'}
                  onChange={() => updateState({ subscriptionType: 'biens_communs' })}
                  className="mt-1"
                />
                <div>
                  <span className="text-sm font-medium text-white block">Biens communs</span>
                  <span className="text-xs text-slate-400">Co-souscription</span>
                </div>
              </label>
            </div>
          </div>
          
          {/* Identité */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-300">Identité</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Civilité *</label>
              <select
                value={state.civility}
                onChange={(e) => updateState({ civility: e.target.value as 'Monsieur' | 'Madame' | 'Autre' })}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Monsieur">Monsieur</option>
                <option value="Madame">Madame</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nom *</label>
              <input
                type="text"
                value={state.lastName}
                onChange={(e) => updateState({ lastName: e.target.value })}
                className={getFieldClasses(state.lastName.trim() === '')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nom de naissance{state.civility === 'Madame' ? ' *' : ''}
              </label>
              <input
                type="text"
                value={state.birthLastName}
                onChange={(e) => updateState({ birthLastName: e.target.value })}
                className={getFieldClasses(state.civility === 'Madame' && state.birthLastName.trim() === '')}
                required={state.civility === 'Madame'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Prénom *</label>
              <input
                type="text"
                value={state.firstName}
                onChange={(e) => updateState({ firstName: e.target.value })}
                className={getFieldClasses(state.firstName.trim() === '')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Date de naissance *</label>
              <p className="text-xs text-slate-400 mb-2">
                💡 Format : JJ/MM/AAAA (ex: 24/12/1985)
              </p>
              <input
                type="text"
                value={state.birthDate || ''}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, ''); // Garder uniquement les chiffres
                  
                  // Limiter à 8 chiffres (JJMMAAAA)
                  if (value.length > 8) {
                    value = value.slice(0, 8);
                  }
                  
                  // Formater en JJ/MM/AAAA
                  if (value.length >= 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2);
                  }
                  if (value.length >= 5) {
                    value = value.slice(0, 5) + '/' + value.slice(5);
                  }
                  
                  updateState({ birthDate: value });
                }}
                placeholder="JJ/MM/AAAA"
                maxLength={10}
                className={getFieldClasses(state.birthDate === '' || !state.birthDate)}
                onBlur={(e) => {
                  // Convertir en format YYYY-MM-DD pour la validation
                  const value = e.target.value;
                  if (value && value.length === 10) {
                    const parts = value.split('/');
                    if (parts.length === 3) {
                      const day = parts[0];
                      const month = parts[1];
                      const year = parts[2];
                      // Valider la date
                      const date = new Date(`${year}-${month}-${day}`);
                      if (date.getDate() == parseInt(day) && 
                          date.getMonth() + 1 == parseInt(month) && 
                          date.getFullYear() == parseInt(year) &&
                          parseInt(year) >= 1900 && 
                          parseInt(year) <= new Date().getFullYear()) {
                        // Date valide, convertir en format YYYY-MM-DD pour le stockage
                        const isoDate = `${year}-${month}-${day}`;
                        updateState({ birthDate: value }); // Garder l'affichage JJ/MM/AAAA
                      } else {
                        // Date invalide, réinitialiser
                        updateState({ birthDate: '' });
                      }
                    }
                  } else if (value && value.length > 0) {
                    // Format incomplet, réinitialiser
                    updateState({ birthDate: '' });
                  }
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Pays de naissance *</label>
              <select
                value={state.birthCountry}
                onChange={(e) => updateState({ birthCountry: e.target.value })}
                className={getFieldClasses(state.birthCountry === '')}
              >
                <option value="">Sélectionner un pays</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Ville de naissance *</label>
              <input
                type="text"
                value={state.birthCity}
                onChange={(e) => updateState({ birthCity: e.target.value })}
                className={getFieldClasses(state.birthCity.trim() === '')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nationalité *</label>
              <select
                value={state.nationality}
                onChange={(e) => updateState({ nationality: e.target.value })}
                className={getFieldClasses(state.nationality === '')}
              >
                <option value="">Sélectionner une nationalité</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Personnalité juridique *</label>
              <select
                value={state.legalPersonality}
                onChange={(e) => updateState({ legalPersonality: e.target.value as 'personne_physique' | 'personne_morale' })}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="personne_physique">Personne physique</option>
                <option value="personne_morale">Personne morale</option>
              </select>
            </div>
          </div>
          </div>

          {/* Contact */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-300 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Contact
            </h3>
            
            <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Adresse complète *</label>
            <input
              type="text"
              value={state.address}
              onChange={(e) => updateState({ address: e.target.value })}
              placeholder="Numéro et nom de rue"
              className={getFieldClasses(state.address.trim() === '')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Code postal *</label>
              <input
                type="text"
                value={state.postalCode}
                onChange={(e) => updateState({ postalCode: e.target.value })}
                className={getFieldClasses(!validatePostalCode(state.postalCode))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Ville *</label>
              <input
                type="text"
                value={state.city}
                onChange={(e) => updateState({ city: e.target.value })}
                className={getFieldClasses(state.city.trim() === '')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Pays *</label>
              <select
                value={state.country}
                onChange={(e) => updateState({ country: e.target.value })}
                className={getFieldClasses(state.country === '')}
              >
                <option value="">Sélectionner un pays</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Téléphone portable *
              </label>
              <input
                type="tel"
                value={state.phone}
                onChange={(e) => updateState({ phone: e.target.value })}
                placeholder="06 12 34 56 78"
                className={getFieldClasses(!validatePhone(state.phone))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email *
              </label>
              <input
                type="email"
                value={state.email}
                onChange={(e) => updateState({ email: e.target.value })}
                placeholder="nom@example.com"
                className={getFieldClasses(!validateEmail(state.email))}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Confirmer l'email *
            </label>
            <input
              type="email"
              value={state.emailConfirmation}
              onChange={(e) => updateState({ emailConfirmation: e.target.value })}
              placeholder="nom@example.com"
              className={getFieldClasses(!validateEmail(state.emailConfirmation) || state.emailConfirmation !== state.email)}
            />
            {state.emailConfirmation && state.emailConfirmation !== state.email && (
              <p className="text-xs text-orange-400 mt-1">Les emails ne correspondent pas</p>
            )}
          </div>
          </div>

          {/* Co-souscripteur - Identité & Contact */}
          {state.subscriptionType === 'biens_communs' && state.coSubscriber && (
            <>
              {/* Séparateur visuel */}
              <div className="my-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                <div className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-full">
                  <span className="text-sm font-semibold text-blue-400">Co-souscripteur</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
              </div>
              
              {/* Identité Co-souscripteur */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-300">Identité</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Civilité *</label>
                    <select
                      value={state.coSubscriber.civility}
                      onChange={(e) => updateCoSubscriber({ civility: e.target.value as 'Monsieur' | 'Madame' | 'Autre' })}
                      className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Monsieur">Monsieur</option>
                      <option value="Madame">Madame</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Nom *</label>
                    <input
                      type="text"
                      value={state.coSubscriber.lastName}
                      onChange={(e) => updateCoSubscriber({ lastName: e.target.value })}
                      className={getFieldClasses(state.coSubscriber.lastName.trim() === '')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nom de naissance{state.coSubscriber.civility === 'Madame' ? ' *' : ''}
                    </label>
                    <input
                      type="text"
                      value={state.coSubscriber.birthLastName}
                      onChange={(e) => updateCoSubscriber({ birthLastName: e.target.value })}
                      className={getFieldClasses(state.coSubscriber.civility === 'Madame' && state.coSubscriber.birthLastName.trim() === '')}
                      required={state.coSubscriber.civility === 'Madame'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Prénom *</label>
                    <input
                      type="text"
                      value={state.coSubscriber.firstName}
                      onChange={(e) => updateCoSubscriber({ firstName: e.target.value })}
                      className={getFieldClasses(state.coSubscriber.firstName.trim() === '')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Date de naissance *</label>
                    <p className="text-xs text-slate-400 mb-2">
                      💡 Format : JJ/MM/AAAA (ex: 24/12/1985)
                    </p>
                    <input
                      type="text"
                      value={state.coSubscriber.birthDate || ''}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length > 8) value = value.slice(0, 8);
                        if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
                        if (value.length >= 5) value = value.slice(0, 5) + '/' + value.slice(5);
                        updateCoSubscriber({ birthDate: value });
                      }}
                      placeholder="JJ/MM/AAAA"
                      maxLength={10}
                      className={getFieldClasses(state.coSubscriber.birthDate === '' || !state.coSubscriber.birthDate)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Pays de naissance *</label>
                    <select
                      value={state.coSubscriber.birthCountry}
                      onChange={(e) => updateCoSubscriber({ birthCountry: e.target.value })}
                      className={getFieldClasses(state.coSubscriber.birthCountry === '')}
                    >
                      <option value="">Sélectionner un pays</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Ville de naissance *</label>
                    <input
                      type="text"
                      value={state.coSubscriber.birthCity}
                      onChange={(e) => updateCoSubscriber({ birthCity: e.target.value })}
                      className={getFieldClasses(state.coSubscriber.birthCity.trim() === '')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Nationalité *</label>
                    <select
                      value={state.coSubscriber.nationality}
                      onChange={(e) => updateCoSubscriber({ nationality: e.target.value })}
                      className={getFieldClasses(state.coSubscriber.nationality === '')}
                    >
                      <option value="">Sélectionner une nationalité</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Personnalité juridique *</label>
                    <select
                      value={state.coSubscriber.legalPersonality}
                      onChange={(e) => updateCoSubscriber({ legalPersonality: e.target.value as 'personne_physique' | 'personne_morale' })}
                      className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="personne_physique">Personne physique</option>
                      <option value="personne_morale">Personne morale</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Co-souscripteur */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contact
                </h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Adresse complète *</label>
                  <input
                    type="text"
                    value={state.coSubscriber.address}
                    onChange={(e) => updateCoSubscriber({ address: e.target.value })}
                    placeholder="Numéro et nom de rue"
                    className={getFieldClasses(state.coSubscriber.address.trim() === '')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Code postal *</label>
                    <input
                      type="text"
                      value={state.coSubscriber.postalCode}
                      onChange={(e) => updateCoSubscriber({ postalCode: e.target.value })}
                      className={getFieldClasses(!validatePostalCode(state.coSubscriber.postalCode))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Ville *</label>
                    <input
                      type="text"
                      value={state.coSubscriber.city}
                      onChange={(e) => updateCoSubscriber({ city: e.target.value })}
                      className={getFieldClasses(state.coSubscriber.city.trim() === '')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Pays *</label>
                    <select
                      value={state.coSubscriber.country}
                      onChange={(e) => updateCoSubscriber({ country: e.target.value })}
                      className={getFieldClasses(state.coSubscriber.country === '')}
                    >
                      <option value="">Sélectionner un pays</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Téléphone portable *
                    </label>
                    <input
                      type="tel"
                      value={state.coSubscriber.phone}
                      onChange={(e) => updateCoSubscriber({ phone: e.target.value })}
                      placeholder="06 12 34 56 78"
                      className={getFieldClasses(!validatePhone(state.coSubscriber.phone))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email *
                    </label>
                    <input
                      type="email"
                      value={state.coSubscriber.email}
                      onChange={(e) => updateCoSubscriber({ email: e.target.value })}
                      placeholder="nom@example.com"
                      className={getFieldClasses(!validateEmail(state.coSubscriber.email))}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Confirmer l'email *
                  </label>
                  <input
                    type="email"
                    value={state.coSubscriber.emailConfirmation || ''}
                    onChange={(e) => updateCoSubscriber({ emailConfirmation: e.target.value })}
                    placeholder="nom@example.com"
                    className={getFieldClasses(!validateEmail(state.coSubscriber.emailConfirmation || '') || (state.coSubscriber.emailConfirmation || '') !== state.coSubscriber.email)}
                  />
                  {state.coSubscriber.emailConfirmation && state.coSubscriber.emailConfirmation !== state.coSubscriber.email && (
                    <p className="text-xs text-orange-400 mt-1">Les emails ne correspondent pas</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Avertissement */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-400 leading-relaxed">
            💡 <strong>Astuce :</strong> Prenez un moment pour vérifier l'exactitude de vos coordonnées. Cela permettra à votre conseiller de vous contacter facilement et d'assurer le suivi optimal de votre projet.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => goToStep(2)}
            className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
          >
            Retour
          </button>
          <button
            onClick={handleContinue}
            disabled={!validateStep(3)}
            className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            Continuer
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3Identite;

