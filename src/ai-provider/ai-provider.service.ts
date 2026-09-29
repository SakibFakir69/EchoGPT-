
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { EncryptionService } from '../common/encryption/encryption.service.js';
import { ProviderStrategyFactory } from './strategies/strategy.factory.js';
import { CreateProviderDto } from './dto/create-provider.dto.js';
import { UpdateProviderDto } from './dto/update-provider.dto.js';
import { AIProviderType } from '../generated/prisma/enums.js'; 

@Injectable()
export class AiProviderService {

  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService,
    private strategyFactory: ProviderStrategyFactory,
  ) {}

  async create(dto: CreateProviderDto) {

    const encryptedKey = this.encryption.encrypt(dto.apiKey );

    const isFirstProvider = (await this.prisma.aIProvider.count()) === 0;

    try {
      return await this.prisma.$transaction(async (tx) => {
        if (dto.isDefault || isFirstProvider) {
          await tx.aIProvider.updateMany({ data: { isDefault: false } });
        }
        const provider = await tx.aIProvider.create({
          data: {
            name: dto.name,
            type: dto.type,
            apiKey: encryptedKey,
            model: dto.model,
            baseUrl: dto.baseUrl,
            isDefault: dto.isDefault ?? isFirstProvider,
          },
        });
        return this.sanitize(provider);
      });
    } catch (err) {
      this.handleUniqueConstraint(err);
      throw err;
    }
  }

  async findAll() {
    const providers = await this.prisma.aIProvider.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return providers.map((p) => this.sanitize(p));
  }

  async findOne(id: string) {
    const provider = await this.prisma.aIProvider.findUnique({ where: { id } });
    if (!provider) throw new NotFoundException('Provider not found');
    return this.sanitize(provider);
  }

  private async findRaw(id: string) {
    const provider = await this.prisma.aIProvider.findUnique({ where: { id } });
    if (!provider) throw new NotFoundException('Provider not found');
    return provider;
  }

  async update(id: string, dto: UpdateProviderDto) {
    await this.findRaw(id);

    const data: any = { ...dto };
    delete data.apiKey;
    if (dto.apiKey) {
      data.apiKey = this.encryption.encrypt(dto.apiKey);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        
        if (dto.isDefault) {
          await tx.aIProvider.updateMany({ data: { isDefault: false } });
        }
        const provider = await tx.aIProvider.update({ where: { id }, data });
        return this.sanitize(provider);
      });
    } catch (err) {
      this.handleUniqueConstraint(err);
      throw err;
    }
  }

  async remove(id: string) {

    const provider = await this.findRaw(id);
    if (provider.isDefault) {
      throw new ConflictException(
        'Cannot delete the default provider — set another provider as default first',
      );
    }
    await this.prisma.aIProvider.delete({ where: { id } });
    return { success: true };
  }

  async setEnabled(id: string, isEnabled: boolean) {
    const provider = await this.findRaw(id);
    if (!isEnabled && provider.isDefault) {
      throw new ConflictException(
        'Cannot disable the default provider — set another provider as default first',
      );
    }
    const updated = await this.prisma.aIProvider.update({
      where: { id },
      data: { isEnabled },
    });
    return this.sanitize(updated);
  }

  async setDefault(id: string) {
    const target = await this.findRaw(id);
    if (!target.isEnabled) {
      throw new ConflictException('Cannot set a disabled provider as default');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.aIProvider.updateMany({ data: { isDefault: false } });
        const updated = await tx.aIProvider.update({
          where: { id },
          data: { isDefault: true },
        });
        return this.sanitize(updated);
      });
    } catch (err) {
      this.handleUniqueConstraint(err);
      throw err;
    }
  }

  async getDefaultRaw() {
    const provider = await this.prisma.aIProvider.findFirst({ where: { isDefault: true } });
    if (!provider) throw new NotFoundException('No default provider configured');
    return provider;
  }

  // internal use only — never expose over HTTP
  async getDecryptedKey(id: string): Promise<string> {
    const provider = await this.findRaw(id);
    return this.encryption.decrypt(provider.apiKey);
  }

  async healthCheck(id: string) {
    const provider = await this.findRaw(id);
    const apiKey = this.encryption.decrypt(provider.apiKey);
    const strategy = this.strategyFactory.getStrategy(provider.type);
    const result = await strategy.healthCheck(apiKey, provider.baseUrl ?? undefined);

    return {
      providerId: provider.id,
      name: provider.name,
      type: provider.type,
      ...result,
      checkedAt: new Date().toISOString(),
    };
  }

  async healthCheckAll() {
    const providers = await this.prisma.aIProvider.findMany({ where: { isEnabled: true } });
    return Promise.all(providers.map((p) => this.healthCheck(p.id)));
  }

  private sanitize(provider: any) {
    const { apiKey, ...rest } = provider;
    return {
      ...rest,
      apiKeyMasked: this.encryption.mask(this.encryption.decrypt(apiKey)),
    };
  }

  private handleUniqueConstraint(err: unknown) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException('A provider with conflicting unique fields already exists');
    }
  }
}