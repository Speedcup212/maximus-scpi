import React, { useRef } from 'react';
import { ArrowLeft, ArrowRight, Upload, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';

interface Step8JustificatifsProps {
  onClose?: () => void;
}

const Step8Justificatifs: React.FC<Step8JustificatifsProps> = ({ onClose }) => {
  const { state, updateState, goToStep, validateStep } = useSubscription();
  
  const cniRectoRef = useRef<HTMLInputElement>(null);
  const cniVersoRef = useRef<HTMLInputElement>(null);
  const proofOfResidenceRef = useRef<HTMLInputElement>(null);
  const proofOfFundOriginRef = useRef<HTMLInputElement>(null);
  const ribRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (field: 'cniRecto' | 'cniVerso' | 'proofOfResidence' | 'proofOfFundOrigin' | 'rib', file: File | null) => {
    updateState({ [field]: file });
  };

  const handleContinue = () => {
    if (!validateStep(8)) {
      return;
    }
    goToStep(9);
  };

  const isStepValid = validateStep(8);

  const FileUploadField = ({ 
    label, 
    field, 
    fileRef, 
    currentFile,
    description 
  }: { 
    label: string; 
    field: 'cniRecto' | 'cniVerso' | 'proofOfResidence' | 'proofOfFundOrigin' | 'rib';
    fileRef: React.RefObject<HTMLInputElement>;
    currentFile: File | null | undefined;
    description?: string;
  }) => {
    const hasFile = currentFile !== null && currentFile !== undefined;
    
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label} *
        </label>
        {description && (
          <p className="text-xs text-slate-400 mb-3">{description}</p>
        )}
        
        <div className="relative">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              handleFileChange(field, file);
            }}
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={`w-full px-6 py-4 rounded-xl border-2 transition-colors flex items-center justify-center gap-3 ${
              hasFile
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            {hasFile ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{currentFile?.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileChange(field, null);
                    if (fileRef.current) {
                      fileRef.current.value = '';
                    }
                  }}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span className="font-medium">Cliquez pour télécharger</span>
              </>
            )}
          </button>
        </div>
        
        {!hasFile && !isStepValid && (
          <p className="text-xs text-orange-400 mt-2">Ce justificatif est obligatoire</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => goToStep(7)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-emerald-400" />
            Justificatifs
          </h1>
          <p className="text-slate-400">
            Transmettez les justificatifs nécessaires afin de compléter votre dossier
          </p>
        </div>

        {/* Identité souscripteur */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Identité souscripteur</h2>
          
          <FileUploadField
            label="Carte Nationale d'identité (CNI) (recto)"
            field="cniRecto"
            fileRef={cniRectoRef}
            currentFile={state.cniRecto}
            description="Format accepté : PDF, JPG, PNG"
          />
          
          <FileUploadField
            label="Carte Nationale d'identité (CNI) (verso)"
            field="cniVerso"
            fileRef={cniVersoRef}
            currentFile={state.cniVerso}
            description="Format accepté : PDF, JPG, PNG"
          />
        </div>

        {/* Justificatifs complémentaires */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Justificatifs complémentaires</h2>
          
          <FileUploadField
            label="Justificatif de domicile"
            field="proofOfResidence"
            fileRef={proofOfResidenceRef}
            currentFile={state.proofOfResidence}
            description="Facture d'électricité, de gaz, d'eau, de téléphone fixe, quittance de loyer, etc. (moins de 3 mois)"
          />
          
          <FileUploadField
            label="Justificatif d'origine des fonds"
            field="proofOfFundOrigin"
            fileRef={proofOfFundOriginRef}
            currentFile={state.proofOfFundOrigin}
            description="Relevé bancaire, avis d'imposition, acte de vente, etc."
          />
          
          <FileUploadField
            label="RIB"
            field="rib"
            fileRef={ribRef}
            currentFile={state.rib}
            description="Relevé d'Identité Bancaire (format PDF, JPG, PNG)"
          />
        </div>

        {/* Message informatif */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-400 leading-relaxed">
            💡 <strong>Conseil :</strong> Assurez-vous que tous les documents sont lisibles et complets. Les formats acceptés sont PDF, JPG et PNG. Si vous rencontrez des difficultés, votre conseiller pourra vous aider lors de la finalisation de votre dossier.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => goToStep(7)}
            className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
          >
            Retour
          </button>
          <button
            onClick={handleContinue}
            disabled={!validateStep(8)}
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

export default Step8Justificatifs;


