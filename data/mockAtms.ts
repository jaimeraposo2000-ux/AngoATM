
import { ATM, ATMStatus } from '../types';

const now = Date.now();

export const mockAtms: ATM[] = [
  {
    id: 'beng-1',
    bankName: 'BAI',
    address: 'Av. Agostinho Neto, Próximo ao Jardim da Estátua',
    neighborhood: 'Praia Morena',
    city: 'Benguela',
    province: 'Benguela',
    status: ATMStatus.CASH,
    lastUpdated: 'há 5 min',
    lastUpdatedTimestamp: now - (5 * 60000),
    coordinates: [-12.5855, 13.3988],
    isSafe: true,
    hours: '24/7',
    votes: { hasCash: 24, noCash: 1 }
  },
  {
    id: 'lobi-1',
    bankName: 'BFA',
    address: 'Ponta da Restinga, Edifício Tamariz',
    neighborhood: 'Restinga',
    city: 'Lobito',
    province: 'Benguela',
    status: ATMStatus.NO_CASH,
    lastUpdated: 'há 12 min',
    lastUpdatedTimestamp: now - (12 * 60000),
    coordinates: [-12.3288, 13.5455],
    isSafe: true,
    hours: '08:00 - 22:00',
    votes: { hasCash: 2, noCash: 18 }
  },
  {
    id: 'catu-1',
    bankName: 'BIC',
    address: 'Aeroporto Internacional da Catumbela',
    neighborhood: 'Zona Aeroportuária',
    city: 'Catumbela',
    province: 'Benguela',
    status: ATMStatus.CASH,
    lastUpdated: 'há 45 min',
    lastUpdatedTimestamp: now - (45 * 60000),
    coordinates: [-12.4802, 13.4844],
    isSafe: true,
    hours: '24/7',
    votes: { hasCash: 15, noCash: 0 }
  },
  {
    id: 'lobi-2',
    bankName: 'SOL',
    address: 'Porto do Lobito, Terminal de Contentores',
    neighborhood: 'Porto',
    city: 'Lobito',
    province: 'Benguela',
    status: ATMStatus.CASH,
    lastUpdated: 'há 2h',
    lastUpdatedTimestamp: now - (120 * 60000),
    coordinates: [-12.3455, 13.5322],
    isSafe: true,
    hours: '24/7',
    votes: { hasCash: 8, noCash: 2 }
  },
  {
    id: 'beng-2',
    bankName: 'ATLANTICO',
    address: 'Rua de Luanda, Próximo ao Mercado Municipal',
    neighborhood: 'Centro',
    city: 'Benguela',
    province: 'Benguela',
    status: ATMStatus.UNKNOWN,
    lastUpdated: 'há 6h',
    lastUpdatedTimestamp: now - (360 * 60000),
    coordinates: [-12.5766, 13.4111],
    isSafe: false,
    hours: '24/7',
    votes: { hasCash: 0, noCash: 0 }
  },
  {
    id: 'baia-1',
    bankName: 'BPC',
    address: 'Centro da Vila, Rua da Administração',
    neighborhood: 'Sede',
    city: 'Baía Farta',
    province: 'Benguela',
    status: ATMStatus.OUT_OF_SERVICE,
    lastUpdated: 'há 1 dia',
    lastUpdatedTimestamp: now - (1440 * 60000),
    coordinates: [-12.6122, 13.1944],
    isSafe: true,
    hours: 'Indisponível',
    votes: { hasCash: 0, noCash: 12 }
  },
  {
    id: 'gand-1',
    bankName: 'KEVE',
    address: 'Largo da Estação da Ganda',
    neighborhood: 'Centro Ganda',
    city: 'Ganda',
    province: 'Benguela',
    status: ATMStatus.CASH,
    lastUpdated: 'há 15 min',
    lastUpdatedTimestamp: now - (15 * 60000),
    coordinates: [-13.0333, 14.6333],
    isSafe: true,
    hours: '24/7',
    votes: { hasCash: 7, noCash: 1 }
  }
];
