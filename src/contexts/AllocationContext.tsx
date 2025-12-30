import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { SCPIExtended } from '../data/scpiDataExtended';

interface AllocationWeight {
  scpiId: number;
  weight: number;
  amount: number;
}

interface AllocationContextType {
  totalInvestment: number;
  setTotalInvestment: (amount: number) => void;
  weights: Record<number, number>;
  setWeight: (scpiId: number, weight: number) => void;
  distributeEqually: (scpis: SCPIExtended[]) => void;
  getWeightedYield: (scpis: SCPIExtended[]) => number;
  getMonthlyRevenue: (scpis: SCPIExtended[]) => number;
  getTenYearProjection: (scpis: SCPIExtended[]) => number;
  getAllocationDetails: (scpis: SCPIExtended[]) => AllocationWeight[];
}

const AllocationContext = createContext<AllocationContextType | undefined>(undefined);

export const AllocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [totalInvestment, setTotalInvestment] = useState<number>(50000);
  const [weights, setWeights] = useState<Record<number, number>>({});

  const setWeight = useCallback((scpiId: number, weight: number) => {
    setWeights(prev => ({
      ...prev,
      [scpiId]: Math.max(0, Math.min(100, weight))
    }));
  }, []);

  const distributeEqually = useCallback((scpis: SCPIExtended[]) => {
    if (scpis.length === 0) return;
    const equalWeight = 100 / scpis.length;
    const newWeights: Record<number, number> = {};
    scpis.forEach(scpi => {
      newWeights[scpi.id] = equalWeight;
    });
    setWeights(newWeights);
  }, []);

  const getWeightedYield = useCallback((scpis: SCPIExtended[]): number => {
    if (scpis.length === 0) return 0;

    const totalWeight = scpis.reduce((sum, scpi) => sum + (weights[scpi.id] || 0), 0);
    if (totalWeight === 0) return 0;

    const weightedSum = scpis.reduce((sum, scpi) => {
      const weight = weights[scpi.id] || 0;
      return sum + (scpi.yield * weight);
    }, 0);

    return weightedSum / totalWeight;
  }, [weights]);

  const getMonthlyRevenue = useCallback((scpis: SCPIExtended[]): number => {
    const weightedYield = getWeightedYield(scpis);
    return (totalInvestment * weightedYield) / 100 / 12;
  }, [totalInvestment, getWeightedYield]);

  const getTenYearProjection = useCallback((scpis: SCPIExtended[]): number => {
    const weightedYield = getWeightedYield(scpis);
    const annualRevenue = (totalInvestment * weightedYield) / 100;
    return annualRevenue * 10;
  }, [totalInvestment, getWeightedYield]);

  const getAllocationDetails = useCallback((scpis: SCPIExtended[]): AllocationWeight[] => {
    return scpis.map(scpi => ({
      scpiId: scpi.id,
      weight: weights[scpi.id] || 0,
      amount: (totalInvestment * (weights[scpi.id] || 0)) / 100
    }));
  }, [weights, totalInvestment]);

  return (
    <AllocationContext.Provider
      value={{
        totalInvestment,
        setTotalInvestment,
        weights,
        setWeight,
        distributeEqually,
        getWeightedYield,
        getMonthlyRevenue,
        getTenYearProjection,
        getAllocationDetails
      }}
    >
      {children}
    </AllocationContext.Provider>
  );
};

export const useAllocation = () => {
  const context = useContext(AllocationContext);
  if (!context) {
    throw new Error('useAllocation must be used within AllocationProvider');
  }
  return context;
};
