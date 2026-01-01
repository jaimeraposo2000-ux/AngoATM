
export enum ATMStatus {
  CASH = 'CASH',
  NO_CASH = 'NO_CASH',
  UNKNOWN = 'UNKNOWN',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export interface ATM {
  id: string;
  bankName: string;
  address: string;
  neighborhood: string;
  city: string;
  province: 'Benguela';
  status: ATMStatus;
  lastUpdated: string; // Texto amigável
  lastUpdatedTimestamp: number; // Timestamp real para cálculos
  // Added coordinates to satisfy the mock data and the map component requirements
  coordinates: [number, number];
  isSafe: boolean;
  hours: string;
  votes: {
    hasCash: number;
    noCash: number;
  };
}

export type ViewMode = 'MAP' | 'NEARBY' | 'FAVORITES' | 'PROFILE';

export const CIDADES_BENGUELA = [
  "Benguela",
  "Lobito",
  "Baía Farta",
  "Catumbela",
  "Ganda",
  "Bocoio",
  "Cubal",
  "Balombo",
  "Chongorói"
];
