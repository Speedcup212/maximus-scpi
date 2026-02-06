export interface SCPIMock {
  id: string;
  name: string;
  managementCompany: string;
  yield: number;
  price: number;
  minInvestment: number;
  tof: number;
  capitalization: string;
  category: string;
  strategy: string;
  logoUrl?: string;
}

export const scpiData: SCPIMock[] = [
  {
    id: '1',
    name: 'Comète',
    managementCompany: 'Alderan',
    yield: 9.0,
    price: 250,
    minInvestment: 5000,
    tof: 99.1,
    capitalization: '519,6M€',
    category: 'Diversifiée',
    strategy: 'Diversification patrimoniale multi-actifs'
  },
  {
    id: '2',
    name: 'Remake Live',
    managementCompany: 'Remake AM',
    yield: 8.75,
    price: 185,
    minInvestment: 1850,
    tof: 95.2,
    capitalization: '245M€',
    category: 'Résidentiel',
    strategy: 'Logements réhabilités éco-responsables'
  },
  {
    id: '3',
    name: 'Iroko Zen',
    managementCompany: 'Iroko',
    yield: 7.21,
    price: 210,
    minInvestment: 2100,
    tof: 97.8,
    capitalization: '580M€',
    category: 'Santé',
    strategy: 'Établissements de santé et EHPAD'
  },
  {
    id: '4',
    name: 'Pierval Santé',
    managementCompany: 'Perial AM',
    yield: 6.85,
    price: 320,
    minInvestment: 3200,
    tof: 98.5,
    capitalization: '1.2Md€',
    category: 'Santé',
    strategy: 'Immobilier de santé premium'
  },
  {
    id: '5',
    name: 'Épargne Pierre',
    managementCompany: 'Atland Voisin',
    yield: 5.92,
    price: 1050,
    minInvestment: 1050,
    tof: 91.4,
    capitalization: '3.5Md€',
    category: 'Bureaux',
    strategy: 'Bureaux et commerces premium'
  },
  {
    id: '6',
    name: 'PF Grand Paris',
    managementCompany: 'Perial AM',
    yield: 5.45,
    price: 1180,
    minInvestment: 1180,
    tof: 94.7,
    capitalization: '2.8Md€',
    category: 'Bureaux',
    strategy: 'Bureaux Île-de-France'
  },
  {
    id: '7',
    name: 'Corum XL',
    managementCompany: 'Corum AM',
    yield: 6.25,
    price: 1050,
    minInvestment: 5250,
    tof: 89.3,
    capitalization: '950M€',
    category: 'Européenne',
    strategy: 'Diversification européenne'
  },
  {
    id: '8',
    name: 'Transitions Europe',
    managementCompany: 'La Française REM',
    yield: 5.75,
    price: 195,
    minInvestment: 1950,
    tof: 96.1,
    capitalization: '420M€',
    category: 'Diversifiée',
    strategy: 'Transition énergétique'
  }
];

export const categories = [
  'Diversifiée',
  'Résidentiel',
  'Santé',
  'Bureaux',
  'Européenne'
];
