import { todayMetrics, type HealthMetrics } from "@/data/healthData";

export interface HealthService {
  getTodayMetrics(): Promise<HealthMetrics>;
}

export const healthService: HealthService = {
  async getTodayMetrics() {
    return todayMetrics;
  },
};
