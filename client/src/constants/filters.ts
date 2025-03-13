import { FilterParams } from '../types/filters';

export const DEFAULT_FILTERS: FilterParams = {
  gender: [],
  appearance: {
    age: [18, 70] as [number, number],
    height: [140, 195] as [number, number],
    weight: [40, 110] as [number, number],
    breastSize: [1, 10] as [number, number],
    nationality: [],
    hairColor: [],
    bikiniZone: [],
  },
  district: [],
  price: {
    from: null,
    to: null,
    hasExpress: false,
  },
  services: [],
  verification: [],
  other: [],
  outcall: false,
}; 