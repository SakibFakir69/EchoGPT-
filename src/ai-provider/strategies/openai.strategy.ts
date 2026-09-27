// src/ai-provider/strategies/openai.strategy.ts
import { Injectable } from '@nestjs/common';
import { AiProviderStrategy, HealthCheckResult } from './ai-provider.strategy.js';

@Injectable()
export class OpenAiStrategy implements AiProviderStrategy {
  async healthCheck(apiKey: string, baseUrl = 'https://api.openai.com/v1'): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const res = await fetch(`${baseUrl}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return { healthy: true, latencyMs: Date.now() - start };
    } catch (err: any) {
      return { healthy: false, latencyMs: Date.now() - start, error: err.message };
    }
  }
}