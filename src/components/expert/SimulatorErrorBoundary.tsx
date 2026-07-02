import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  onBack?: () => void;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * ErrorBoundary local pour le simulateur Holding IS.
 * Empêche la page blanche en affichant un fallback propre.
 */
export class SimulatorErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || 'Erreur inconnue' };
  }

  componentDidCatch(error: Error) {
    console.error('[SimulatorErrorBoundary]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-lg w-full text-center space-y-5">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-red-950/50 border border-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-white">Impossible de charger le simulateur</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Une erreur technique empêche l'affichage du simulateur.
              Veuillez recharger la page ou revenir au tableau de bord.
            </p>
            {this.state.errorMessage && (
              <p className="text-xs text-red-400/70 font-mono bg-red-950/20 rounded-lg p-3 break-all">
                {this.state.errorMessage}
              </p>
            )}
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Recharger
              </button>
              {this.props.onBack && (
                <button
                  onClick={this.props.onBack}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Retour dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
