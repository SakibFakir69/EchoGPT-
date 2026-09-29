// admin/admin.controller.ts
import {
  Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe,
  Patch, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AdminService } from './admin.service.js';
import { AuthGuard } from '../auth/auth.guard.js';

import { Roles, RolesGuard } from '../common/decorators/roles.decorator.js';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';
import {
  PageQueryDto, UserQueryDto, UpdateRoleDto,
  AdminUpdateSubscriptionDto,  LogQueryDto,
} from './dto/admin.dto.js';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}
const getUser = (req: Request) => req['user'] as unknown as JwtPayload;

@ApiTags('Admin')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Not authenticated' })
@ApiResponse({ status: 403, description: 'Admin access required' })
@Roles('ADMIN')
@UseGuards(AuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}


  @Get('dashboard/stats')
  @ResponseMessage('Dashboard statistics fetched')
  @ApiOperation({ summary: 'Dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Users, subscriptions, requests, error rate' })
  stats() {
    return this.admin.dashboardStats();
  }

  // ---------- Users ----------
  @Get('users')
  @ResponseMessage('Users fetched')
  @ApiOperation({ summary: 'List users (paginated, search, role filter)' })
  users(@Query() q: UserQueryDto) {
    return this.admin.listUsers(q);
  }

  @Get('users/:id')
  @ResponseMessage('User fetched')
  @ApiOperation({ summary: 'Get user details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  user(@Param('id', ParseUUIDPipe) id: string) {
    return this.admin.getUser(id);
  }

  @Patch('users/:id/role')
  @HttpCode(200)
  @ResponseMessage('User role updated')
  @ApiOperation({ summary: 'Change a user role' })
  @ApiResponse({ status: 400, description: 'Cannot change your own role' })
  setRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
    @Req() req: Request,
  ) {
    return this.admin.setRole(id, dto.role, getUser(req).sub);
  }

  @Delete('users/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Soft-delete a user and revoke their sessions' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete yourself' })
  removeUser(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.admin.softDeleteUser(id, getUser(req).sub);
  }

  // ---------- Subscriptions ----------
  @Get('subscriptions')
  @ResponseMessage('Subscriptions fetched')
  @ApiOperation({ summary: 'List all subscriptions' })
  subscriptions(@Query() q: PageQueryDto) {
    return this.admin.listSubscriptions(q);
  }

  @Patch('subscriptions/:userId')
  @HttpCode(200)
  @ResponseMessage('Subscription updated')
  @ApiOperation({ summary: 'Update a user plan, status, or request limit' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  updateSubscription(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: AdminUpdateSubscriptionDto,
  ) {
    return this.admin.updateSubscription(userId, dto);
  }

  @Post('subscriptions/:userId/reset-usage')
  @HttpCode(200)
  @ResponseMessage('Usage reset')
  @ApiOperation({ summary: "Reset a user's used-request counter" })
  resetUsage(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.admin.resetUsage(userId);
  }



  @Get('logs')
  @ResponseMessage('Request logs fetched')
  @ApiOperation({ summary: 'Request logs (filter by status, user, provider)' })
  logs(@Query() q: LogQueryDto) {
    return this.admin.requestLogs(q);
  }

  @Get('health')
  @ResponseMessage('System health fetched')
  @ApiOperation({ summary: 'Database, uptime, memory' })
  health() {
    return this.admin.systemHealth();
  }
}