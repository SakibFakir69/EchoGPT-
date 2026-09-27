// src/ai-provider/strategies/claude.strategy.ts
import { Injectable } from '@nestjs/common';
import { AiProviderStrategy, HealthCheckResult } from './ai-provider.strategy.js';

@Injectable()
export class ClaudeStrategy implements AiProviderStrategy {
  async healthCheck(apiKey: string, baseUrl = 'https://api.anthropic.com/v1'): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const res = await fetch(`${baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-5',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'ping' }],
        }),
      });
      // 400 still means the key authenticated fine (bad request shape, not bad auth)
      if (!res.ok && res.status !== 400) throw new Error(`Status ${res.status}`);
      if (res.status === 401) throw new Error('Invalid API key');
      return { healthy: true, latencyMs: Date.now() - start };
    } catch (err: any) {
      return { healthy: false, latencyMs: Date.now() - start, error: err.message };
    }
  }
}