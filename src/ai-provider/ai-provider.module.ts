
import { Module } from '@nestjs/common';
import { AiProviderController } from './ai-provider.controller.js';
import { AiProviderService } from './ai-provider.service.js';
import { EncryptionService } from '../common/encryption/encryption.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { OpenAiStrategy } from './strategies/openai.strategy.js';
import { ClaudeStrategy } from './strategies/claude.strategy.js';
import { GeminiStrategy } from './strategies/gemini.strategy.js';
import { ProviderStrategyFactory } from './strategies/strategy.factory.js';

@Module({
  imports: [PrismaModule],
  controllers: [AiProviderController],
  providers: [
    AiProviderService,
    EncryptionService,
    OpenAiStrategy,
    ClaudeStrategy,
    GeminiStrategy,
    ProviderStrategyFactory,
  ],
  exports: [AiProviderService],
})
export class AiProviderModule {}