export interface FilterParams {
  gender: string[];
  appearance: {
    age: [number, number];
    height: [number, number];
    weight: [number, number];
    breastSize: [number, number];
    nationality: string[];
    hairColor: string[];
    bikiniZone: string[];
  };
  district: string[];
  price: {
    from: number | null;
    to: number | null;
    hasExpress: boolean;
  };
  services: string[];
  verification: string[];
  other: string[];
  outcall: boolean;
} 