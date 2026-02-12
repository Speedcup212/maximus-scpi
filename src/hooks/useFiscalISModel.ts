import { useMemo } from 'react';
import { computeISSimulation, ISInputs, ISSimulationResult } from '../lib/calculsIS';

export const useFiscalISModel = (inputs: ISInputs): ISSimulationResult => {
  return useMemo(() => computeISSimulation(inputs), [inputs]);
};
