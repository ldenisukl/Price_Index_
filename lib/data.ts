export type PriceItem = {
  id: string;
  category: 'service' | 'fuel' | 'currency' | 'product';
  title: string;
  subtitle: string;
  provider?: string;
  price: string;
  trend: number;
  trendPercent: string;
  status: 'Live' | 'Rising' | 'Stable' | 'Old';
  high?: string;
  low?: string;
  chartData?: number[];
};

export const sampleCards: PriceItem[] = [
  {
    id: 'energy-wti-oil',
    category: 'fuel',
    title: 'WTI Oil',
    subtitle: 'Energy · USD',
    price: '$78.64',
    trend: 1.25,
    trendPercent: '+0.97 (+1.25%)',
    status: 'Live',
    high: '$79.10',
    low: '$77.32',
    chartData: [77.5, 77.8, 78.1, 78.2, 78.4, 78.6]
  },
  {
    id: 'currency-eur-mdl',
    category: 'currency',
    title: 'EUR / MDL',
    subtitle: 'Currency',
    price: '19.43',
    trend: 0.61,
    trendPercent: '+0.12 (+0.61%)',
    status: 'Live',
    high: '19.52',
    low: '19.28',
    chartData: [19.25, 19.30, 19.35, 19.38, 19.40, 19.43]
  },
  {
    id: 'currency-usd-mdl',
    category: 'currency',
    title: 'USD / MDL',
    subtitle: 'Currency',
    price: '17.92',
    trend: 0.28,
    trendPercent: '+0.05 (+0.28%)',
    status: 'Live',
    high: '17.98',
    low: '17.79',
    chartData: [17.75, 17.80, 17.85, 17.88, 17.90, 17.92]
  },
  {
    id: 'service-electrician-chisinau',
    category: 'service',
    title: 'Electrician',
    subtitle: 'Service · Chișinău',
    price: '450 MDL / hr',
    trend: 7.14,
    trendPercent: '+30 (+7.14%)',
    status: 'Rising',
    high: '500',
    low: '400',
    chartData: [420, 430, 435, 440, 445, 450]
  },
  {
    id: 'service-plumber-chisinau',
    category: 'service',
    title: 'Plumber',
    subtitle: 'Service · Chișinău',
    price: '400 MDL / hr',
    trend: 5.26,
    trendPercent: '+20 (+5.26%)',
    status: 'Rising',
    high: '450',
    low: '350',
    chartData: [380, 385, 390, 395, 398, 400]
  },
  {
    id: 'service-cleaning',
    category: 'service',
    title: 'Cleaning Service',
    subtitle: 'Service · Chișinău',
    price: '200 - 600 MDL',
    trend: 1.69,
    trendPercent: '+10 (+1.69%)',
    status: 'Stable',
    high: '600',
    low: '200',
    chartData: [390, 395, 400, 405, 395, 400]
  },
  {
    id: 'service-webdesign',
    category: 'service',
    title: 'Website Design',
    subtitle: 'Service · Remote',
    price: '2,500 - 8,000 MDL',
    trend: 2.08,
    trendPercent: '+150 (+2.08%)',
    status: 'Rising',
    high: '8,000',
    low: '2,500',
    chartData: [4600, 4350, 4500, 4600, 4650, 4750]
  }
];

export const aiExpectations = [
  {
    question: 'electrician Chișinău',
    answer: 'Tariful mediu pentru electrician în Chișinău este 450 MDL/oră, interval 350-600 MDL. Creștere de 7.1% în ultimile 30 de zile datorită creșterii costurilor operaționale și întăriri EUR.'
  },
  {
    question: 'EUR',
    answer: 'EUR / MDL se tranzacționează la 19.43, cu o creștere de 0.61%. Cel mai mic curs recent a fost 19.28 și cel mai mare 19.52.'
  },
  {
    question: 'carburant motorină',
    answer: 'Nu avem suficiente date în MVP pentru carburanți. Poți verifica energia brută sau serviciile disponibile.'
  }
];
