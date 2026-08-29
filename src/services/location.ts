export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationService {
  getDemoLocation(): Promise<Coordinates>;
  shareLiveLocation(): Promise<{ sharing: boolean; demo: true }>;
}

export const locationService: LocationService = {
  async getDemoLocation() {
    return { lat: 28.6139, lng: 77.209 };
  },
  async shareLiveLocation() {
    return { sharing: true, demo: true as const };
  },
};
