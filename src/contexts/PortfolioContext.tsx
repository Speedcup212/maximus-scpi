import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SCPIMock } from '../data/mockScpiData';

interface PortfolioContextType {
  selectedScpi: SCPIMock[];
  addToPortfolio: (scpi: SCPIMock) => void;
  removeFromPortfolio: (scpiId: string) => void;
  isInPortfolio: (scpiId: string) => boolean;
  clearPortfolio: () => void;
  portfolioCount: number;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedScpi, setSelectedScpi] = useState<SCPIMock[]>([]);

  const addToPortfolio = (scpi: SCPIMock) => {
    setSelectedScpi(prev => {
      if (prev.find(s => s.id === scpi.id)) {
        return prev;
      }
      return [...prev, scpi];
    });
  };

  const removeFromPortfolio = (scpiId: string) => {
    setSelectedScpi(prev => prev.filter(s => s.id !== scpiId));
  };

  const isInPortfolio = (scpiId: string) => {
    return selectedScpi.some(s => s.id === scpiId);
  };

  const clearPortfolio = () => {
    setSelectedScpi([]);
  };

  const portfolioCount = selectedScpi.length;

  return (
    <PortfolioContext.Provider
      value={{
        selectedScpi,
        addToPortfolio,
        removeFromPortfolio,
        isInPortfolio,
        clearPortfolio,
        portfolioCount
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolioContext = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolioContext must be used within PortfolioProvider');
  }
  return context;
};
