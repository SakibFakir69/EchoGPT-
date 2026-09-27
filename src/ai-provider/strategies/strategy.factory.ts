

import { Injectable } from '@nestjs/common';
import { AIProviderType } from '@prisma/client';
import { OpenAiStrategy } from './openai.strategy.js';
import { ClaudeStrategy } from './claude.strategy.js';
import { GeminiStrategy } from './gemini.strategy.js';
import { AiProviderStrategy } from './ai-provider.strategy.js';

@Injectable()
export class ProviderStrategyFactory {
  constructor(
    private openai: OpenAiStrategy,
    private claude: ClaudeStrategy,
    private gemini: GeminiStrategy,
  ) {}

  getStrategy(type: AIProviderType): AiProviderStrategy {
    const map: Record<AIProviderType, AiProviderStrategy> = {
      OPENAI: this.openai,
      CLAUDE: this.claude,
      GEMINI: this.gemini,
    };
    return map[type];
  }
}