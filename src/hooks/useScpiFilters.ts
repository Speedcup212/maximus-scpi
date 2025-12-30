import { useState, useMemo, useEffect } from 'react';
import { Scpi, QuickFilterType, Filters } from '../types/scpi';

const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    quickFilter: (params.get('filter') as QuickFilterType) || 'tous',
    sector: params.get('sector') || '',
    geography: params.get('geo') || '',
    minYield: parseFloat(params.get('yield') || '0'),
    minCapitalization: parseInt(params.get('cap') || '0')
  };
};

const updateUrl = (quickFilter: QuickFilterType, filters: Filters) => {
  const params = new URLSearchParams();

  if (quickFilter !== 'tous') params.set('filter', quickFilter);
  if (filters.sector) params.set('sector', filters.sector);
  if (filters.geography) params.set('geo', filters.geography);
  if (filters.minYield > 0) params.set('yield', filters.minYield.toString());
  if (filters.minCapitalization > 0) params.set('cap', filters.minCapitalization.toString());

  const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
  window.history.replaceState({}, '', newUrl);
};

export const useScpiFilters = (scpiData: Scpi[]) => {
  const urlParams = getUrlParams();
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilterType>('tous');
  const [filters, setFilters] = useState<Filters>({
    sector: '',
    geography: '',
    minYield: 0,
    minCapitalization: 0
  });

  useEffect(() => {
    updateUrl(activeQuickFilter, filters);
  }, [activeQuickFilter, filters]);

  const filteredScpi = useMemo(() => {
    let filtered = [...scpiData];

    // Apply quick filters first
    switch (activeQuickFilter) {
      case 'europeennes':
        filtered = filtered.filter(scpi => scpi.european === true);
        break;
      case 'francaises':
        filtered = filtered.filter(scpi => scpi.geography === 'france');
        break;
      case 'isr':
        filtered = filtered.filter(scpi => scpi.isr === true);
        break;
      case 'high-yield':
        filtered = filtered.filter(scpi => scpi.yield >= 6.0);
        break;
    }

    // Apply advanced filters
    if (filters.sector) {
      filtered = filtered.filter(scpi => scpi.sector === filters.sector);
    }
    if (filters.geography) {
      filtered = filtered.filter(scpi => scpi.geography === filters.geography);
    }
    if (filters.minYield > 0) {
      filtered = filtered.filter(scpi => scpi.yield >= filters.minYield);
    }
    if (filters.minCapitalization > 0) {
      filtered = filtered.filter(scpi => scpi.capitalization >= filters.minCapitalization);
    }

    return filtered.sort((a, b) => b.yield - a.yield);
  }, [scpiData, activeQuickFilter, filters]);

  const setQuickFilter = (filterType: QuickFilterType) => {
    setActiveQuickFilter(filterType);
    if (filterType !== 'tous') {
      setFilters({
        sector: '',
        geography: '',
        minYield: 0,
        minCapitalization: 0
      });
    }
  };

  const updateFilter = (key: keyof Filters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return {
    filteredScpi,
    activeQuickFilter,
    setQuickFilter,
    filters,
    updateFilter
  };
};