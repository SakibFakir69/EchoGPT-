import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma, Role } from '../generated/prisma/client.js';

import { AdminUpdateSubscriptionDto,LogQueryDto,PageQueryDto,UpdateRoleDto,UserQueryDto } from './dto/admin.dto.js';
import { RequestLogService } from './request-log.service.js';


const meta = (page: number, limit: number, total: number) => ({
  page, limit, total, totalPages: Math.ceil(total / limit),
});

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logs: RequestLogService,
  ) {}

  // ---------- Dashboard ----------
  async dashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, newToday, admins, premium, activeSubs, providers, enabledProviders, usage] =
      await Promise.all([
        this.prisma.user.count({ where: { isDeleted: false } }),
        this.prisma.user.count({ where: { isDeleted: false, createdAt: { gte: today } } }),
        this.prisma.user.count({ where: { isDeleted: false, role: 'ADMIN' } }),
        this.prisma.subscription.count({ where: { plan: 'PREMIUM', status: 'ACTIVE' } }),
        this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        this.prisma.aIProvider.count(),
        this.prisma.aIProvider.count({ where: { isEnabled: true } }),
        this.prisma.subscription.aggregate({ _sum: { requestsUsed: true } }),
      ]);

    return {
      users: { total: totalUsers, newToday, admins },
      subscriptions: { active: activeSubs, premium, free: activeSubs - premium },
      providers: { total: providers, enabled: enabledProviders },
      totalRequestsUsed: usage._sum.requestsUsed ?? 0,
    };
  }

  // ---------- Users ----------
  async listUsers({ page, limit, search, role }: UserQueryDto) {
    const where: Prisma.UserWhereInput = {
      isDeleted: false,
      ...(role && { role }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, email: true, role: true, createdAt: true,
          subscription: { select: { plan: true, status: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, meta: meta(page, limit, total) };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, isDeleted: false },
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        profile: true, subscription: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async setRole(id: string, role: Role, adminId: string) {
    if (id === adminId) throw new BadRequestException('You cannot change your own role');
    await this.getUser(id);
    return this.prisma.user.update({
      where: { id }, data: { role }, select: { id: true, email: true, role: true },
    });
  }

  async softDeleteUser(id: string, adminId: string) {
    if (id === adminId) throw new BadRequestException('You cannot delete yourself');
    await this.getUser(id);
    await this.prisma.user.update({
      where: { id }, data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  // ---------- Subscriptions ----------
  async listSubscriptions({ page, limit }: PageQueryDto) {
    const [data, total] = await Promise.all([
      this.prisma.subscription.findMany({
        skip: (page - 1) * limit, take: limit, orderBy: { updatedAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.subscription.count(),
    ]);
    return { data, meta: meta(page, limit, total) };
  }

  async updateSubscription(userId: string, dto: AdminUpdateSubscriptionDto) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub) throw new NotFoundException('Subscription not found');
    return this.prisma.subscription.update({ where: { userId }, data: dto });
  }

  async resetUsage(userId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub) throw new NotFoundException('Subscription not found');
    return this.prisma.subscription.update({ where: { userId }, data: { requestsUsed: 0 } });
  }

  // ---------- Usage analytics (from Subscription counters) ----------
  async usageAnalytics() {
    const [byPlan, topUsers, nearLimit] = await Promise.all([
      this.prisma.subscription.groupBy({
        by: ['plan'],
        _sum: { requestsUsed: true },
        _avg: { requestsUsed: true },
        _count: { _all: true },
      }),
      this.prisma.subscription.findMany({
        orderBy: { requestsUsed: 'desc' }, take: 10,
        select: {
          requestsUsed: true, requestLimit: true, plan: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.$queryRaw<{ count: number }[]>`
        SELECT count(*)::int AS count FROM "Subscription"
        WHERE "requestLimit" > 0 AND "requestsUsed" >= "requestLimit" * 0.8`,
    ]);
    return { byPlan, topUsers, usersNearLimit: nearLimit[0]?.count ?? 0 };
  }

  // ---------- Request logs (in-memory) ----------
  requestLogs(q: LogQueryDto) {
    return this.logs.query(q);
  }

  // ---------- Health ----------
  async systemHealth() {
    let db: 'up' | 'down' = 'up';
    const t = Date.now();
    try { await this.prisma.$queryRaw`SELECT 1`; } catch { db = 'down'; }
    const mem = process.memoryUsage();
    return {
      status: db === 'up' ? 'ok' : 'degraded',
      database: { status: db, latencyMs: Date.now() - t },
      uptimeSeconds: Math.floor(process.uptime()),
      memoryMb: { rss: Math.round(mem.rss / 1048576), heapUsed: Math.round(mem.heapUsed / 1048576) },
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    };
  }
}