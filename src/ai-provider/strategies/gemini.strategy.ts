
import { Injectable } from '@nestjs/common';
import { AiProviderStrategy, HealthCheckResult } from './ai-provider.strategy.js';

@Injectable()
export class GeminiStrategy implements AiProviderStrategy {
  async healthCheck(apiKey: string, baseUrl = 'https://generativelanguage.googleapis.com/v1beta'): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const res = await fetch(`${baseUrl}/models?key=${apiKey}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return { healthy: true, latencyMs: Date.now() - start };
    } catch (err: any) {
      return { healthy: false, latencyMs: Date.now() - start, error: err.message };
    }
  }
}