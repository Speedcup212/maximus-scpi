import { useState, useMemo } from 'react';
import { Scpi } from '../types/scpi';

export const usePortfolio = () => {
  const [selectedScpi, setSelectedScpi] = useState<Scpi[]>([]);
  const [investmentAmount, setInvestmentAmount] = useState<number>(50000);

  const toggleScpiSelection = (scpi: Scpi) => {
    const existingIndex = selectedScpi.findIndex(s => s.id === scpi.id);
    
    if (existingIndex >= 0) {
      setSelectedScpi(prev => prev.filter(s => s.id !== scpi.id));
    } else {
      if (selectedScpi.length >= 6) {
        if (typeof window !== 'undefined') {
          window.alert('Vous pouvez sélectionner jusqu’à 6 SCPI maximum dans votre portefeuille.');
        }
        return;
      }
      const newScpi = { ...scpi, allocation: Math.round(100 / (selectedScpi.length + 1)) };
      setSelectedScpi(prev => {
        const updated = [...prev, newScpi];
        return redistributeAllocations(updated);
      });
    }
  };

  const removeScpi = (scpiId: number) => {
    setSelectedScpi(prev => {
      const filtered = prev.filter(s => s.id !== scpiId);
      return redistributeAllocations(filtered);
    });
  };

  const redistributeAllocations = (scpiList: Scpi[]): Scpi[] => {
    if (scpiList.length === 0) return [];
    
    const equalShare = Math.floor(100 / scpiList.length);
    const remainder = 100 - (equalShare * scpiList.length);
    
    return scpiList.map((scpi, index) => ({
      ...scpi,
      allocation: equalShare + (index < remainder ? 1 : 0)
    }));
  };

  const portfolioStats = useMemo(() => {
    if (selectedScpi.length === 0) {
      return {
        averageYield: 0,
        totalCapitalization: 0,
        averageTof: 0,
        sectorDistribution: {},
        geoDistribution: {},
        performanceDistribution: {}
      };
    }

    const averageYield = selectedScpi.reduce((sum, scpi) => 
      sum + (scpi.yield * (scpi.allocation || 0) / 100), 0
    );

    const totalCapitalization = selectedScpi.reduce((sum, scpi) => 
      sum + scpi.capitalization, 0
    );

    const averageTof = selectedScpi.reduce((sum, scpi) => 
      sum + (scpi.tof * (scpi.allocation || 0) / 100), 0
    );

    // Sector distribution
    const sectorDistribution: Record<string, number> = {};
    selectedScpi.forEach(scpi => {
      if (scpi.repartitionSector) {
        const weight = (scpi.allocation || 0) / 100;
        scpi.repartitionSector.forEach(item => {
          if (!sectorDistribution[item.name]) {
            sectorDistribution[item.name] = 0;
          }
          sectorDistribution[item.name] += (item.value * weight);
        });
      }
    });

    // Geographic distribution
    const geoDistribution: Record<string, number> = {};
    selectedScpi.forEach(scpi => {
      if (scpi.repartitionGeo) {
        const weight = (scpi.allocation || 0) / 100;
        scpi.repartitionGeo.forEach(item => {
          if (!geoDistribution[item.name]) {
            geoDistribution[item.name] = 0;
          }
          geoDistribution[item.name] += (item.value * weight);
        });
      }
    });

    // Performance distribution
    const performanceDistribution = {
      'Très haute (>7%)': selectedScpi.filter(s => s.yield > 7).length,
      'Haute (5-7%)': selectedScpi.filter(s => s.yield >= 5 && s.yield <= 7).length,
      'Moyenne (3.5-5%)': selectedScpi.filter(s => s.yield >= 3.5 && s.yield < 5).length,
      'Faible (<3.5%)': selectedScpi.filter(s => s.yield < 3.5).length
    };

    return {
      averageYield,
      totalCapitalization,
      averageTof,
      sectorDistribution,
      geoDistribution,
      performanceDistribution
    };
  }, [selectedScpi]);

  return {
    selectedScpi,
    investmentAmount,
    setInvestmentAmount,
    toggleScpiSelection,
    removeScpi,
    portfolioStats
  };
};