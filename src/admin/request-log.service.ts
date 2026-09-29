// admin/request-log.service.ts
import { Injectable } from '@nestjs/common';
import { LogQueryDto } from './dto/admin.dto.js';

export interface RequestLog {
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  userId: string | null;
  timestamp: string;
}

@Injectable()
export class RequestLogService {
  private readonly max = 1000;
  private readonly buffer: RequestLog[] = [];

  add(entry: RequestLog) {
    this.buffer.push(entry);
    if (this.buffer.length > this.max) this.buffer.shift();
  }

  query({ page, limit, method, userId, errorsOnly }: LogQueryDto) {
    let items = [...this.buffer].reverse(); // newest first
    if (method) items = items.filter(l => l.method === method.toUpperCase());
    if (userId) items = items.filter(l => l.userId === userId);
    if (errorsOnly) items = items.filter(l => l.statusCode >= 400);
    const total = items.length;
    const data = items.slice((page - 1) * limit, page * limit);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}