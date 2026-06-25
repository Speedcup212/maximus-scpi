import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export interface SimulationResult {
  scpiId: number;
  scpiName: string;
  amount: number;
  grossYield: number;
  estimatedTax: number;
  netYield: number;
  netAnnualIncome: number;
}

export interface ProReportScpi {
  scpiId: number;
  scpiName: string;
  amount: number;
  hasVideo: boolean;
  videoUrl?: string;
  bulletinUrl?: string;
}

export interface ProReportSimulation {
  tmi: number;
  duration: number;
  mode: 'comptant' | 'credit' | 'demembrement';
  results: SimulationResult[];
}

export interface ProReport {
  id: string;
  cgpId: string;
  cabinetName: string;
  selectedScpi: ProReportScpi[];
  simulation: ProReportSimulation | null;
  createdAt: string;
}

interface ProReportContextType {
  report: ProReport | null;
  addScpi: (scpi: ProReportScpi) => void;
  removeScpi: (scpiId: number) => void;
  setSimulation: (simulation: ProReportSimulation) => void;
  clearReport: () => void;
  generateReport: () => Promise<{ url: string } | null>;
  scpiCount: number;
  hasSimulation: boolean;
}

const ProReportContext = createContext<ProReportContextType | undefined>(undefined);

export const useProReport = (): ProReportContextType => {
  const context = useContext(ProReportContext);
  if (!context) {
    throw new Error('useProReport doit être utilisé dans un ProReportProvider');
  }
  return context;
};

const generateId = (): string => {
  return 'report_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
};

export const ProReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cabinetName, setCabinetName] = useState<string>('');

  const initReport = useCallback((): ProReport | null => {
    if (!user) return null;
    return {
      id: generateId(),
      cgpId: user.id,
      cabinetName: cabinetName,
      selectedScpi: [],
      simulation: null,
      createdAt: new Date().toISOString(),
    };
  }, [user, cabinetName]);

  const [report, setReport] = useState<ProReport | null>(() => initReport());

  // Charger le nom du cabinet depuis cgp_profiles
  React.useEffect(() => {
    if (!user) return;
    const fetchCabinetName = async () => {
      try {
        const { data } = await supabase
          .from('cgp_profiles')
          .select('company_name')
          .eq('id', user.id)
          .single();
        if (data?.company_name) {
          setCabinetName(data.company_name);
        }
      } catch {
        // Silencieux si pas de profil
      }
    };
    fetchCabinetName();
  }, [user]);

  // Synchroniser le cabinetName dans le report
  React.useEffect(() => {
    if (cabinetName && report) {
      setReport((prev) => (prev ? { ...prev, cabinetName } : prev));
    }
  }, [cabinetName]);

  const addScpi = useCallback((scpi: ProReportScpi) => {
    setReport((prev) => {
      const current = prev || initReport();
      if (!current) return null;

      const exists = current.selectedScpi.some((s) => s.scpiId === scpi.scpiId);
      if (exists) return current;

      if (current.selectedScpi.length >= 4) return current;

      return {
        ...current,
        selectedScpi: [...current.selectedScpi, scpi],
      };
    });
  }, [initReport]);

  const removeScpi = useCallback((scpiId: number) => {
    setReport((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        selectedScpi: prev.selectedScpi.filter((s) => s.scpiId !== scpiId),
      };
    });
  }, []);

  const setSimulation = useCallback((simulation: ProReportSimulation) => {
    setReport((prev) => {
      const current = prev || initReport();
      if (!current) return null;
      return { ...current, simulation };
    });
  }, [initReport]);

  const clearReport = useCallback(() => {
    setReport(initReport());
  }, [initReport]);

  const generateReport = useCallback(async (): Promise<{ url: string } | null> => {
    if (!report || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from('pro_reports')
        .insert({
          cgp_id: report.cgpId,
          cabinet_name: report.cabinetName,
          report_data: report,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Erreur génération rapport:', error);
        return null;
      }

      const url = `${window.location.origin}/pro/report/${data.id}`;
      return { url };
    } catch (err) {
      console.error('Erreur génération rapport:', err);
      return null;
    }
  }, [report]);

  const scpiCount = report?.selectedScpi.length || 0;
  const hasSimulation = report?.simulation !== null;

  return (
    <ProReportContext.Provider
      value={{
        report,
        addScpi,
        removeScpi,
        setSimulation,
        clearReport,
        generateReport,
        scpiCount,
        hasSimulation,
      }}
    >
      {children}
    </ProReportContext.Provider>
  );
};
