

export interface HealthCheckResult {
  healthy: boolean;
  latencyMs: number;
  error?: string;
}

export interface AiProviderStrategy {
  healthCheck(apiKey: string, baseUrl?: string): Promise<HealthCheckResult>;
}