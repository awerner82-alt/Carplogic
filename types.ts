
export interface WeatherData {
  temp: number;
  apparentTemp: number;
  pressure: number;
  windSpeed: number;
  windGusts: number;
  windDirection: number; // Degree for rotation
  windDirectionStr: string;
  condition: string;
  humidity: number;
  precipProb: number;
  cloudCover: number;
  moonPhase: string;
  moonIllumination: number;
  sunrise: string;
  sunset: string;
  next2hRain: number; // Probability in %
  next2hRainAmount: number; // Amount in mm
  next2hWind: number;
}

export interface TacticalAdvice {
  strategyName: string;
  baitAdvice: string;
  rigAdvice: string;
  spotAdvice: string;
  reasoning: string;
  activityScore: number;
}

export interface CatchRecord {
  id: string;
  date: string;
  weight: number;
  species: string;
  image?: string;
  location: string;
  bait: string;
}

export enum NavigationTab {
  DASHBOARD = 'DASHBOARD',
  ADVISOR = 'ADVISOR',
  LOGBOOK = 'LOGBOOK'
}
