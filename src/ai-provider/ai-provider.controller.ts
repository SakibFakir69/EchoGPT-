// src/ai-provider/ai-provider.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AiProviderService } from './ai-provider.service.js';
import { CreateProviderDto } from './dto/create-provider.dto.js';
import { UpdateProviderDto } from './dto/update-provider.dto.js';

import { AdminGuard } from '../auth/guards/admin.guard.js';

import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard, AdminGuard)
@Controller('admin/ai-providers')
export class AiProviderController {
  constructor(private readonly service: AiProviderService) {}

  @Post()
  create(@Body() dto: CreateProviderDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('health/all')
  checkAllHealth() {
    return this.service.healthCheckAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProviderDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Patch(':id/enable')
  enable(@Param('id') id: string) {
    return this.service.setEnabled(id, true);
  }

  @Patch(':id/disable')
  disable(@Param('id') id: string) {
    return this.service.setEnabled(id, false);
  }

  @Patch(':id/set-default')
  setDefault(@Param('id') id: string) {
    return this.service.setDefault(id);
  }

  @Get(':id/health')
  checkHealth(@Param('id') id: string) {
    return this.service.healthCheck(id);
  }
}