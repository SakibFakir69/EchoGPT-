import { PrismaService } from '../prisma/prisma.service.js';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto/update-user.dto.js';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private excludePassword<T extends { password: string }>(user: T) {
    const { password, ...rest } = user;
    return rest;
  }

  async CreateUser(payload: CreateUserDto) {
    const isAlreadyEmailExits = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (isAlreadyEmailExits) {
      throw new BadRequestException('You have already created account');
    }

    const saltRounds = parseInt(process.env.SALT_ROUND ?? '10', 10);
    const hashPassword = (await bcrypt.hash(payload.password, saltRounds)) as string;

    const createUserData = await this.prisma.user.create({
      data: { ...payload, password: hashPassword },
    });

    return this.excludePassword(createUserData);
  }

  async GetAllUsers() {
    const users = await this.prisma.user.findMany({
      where: { isDeleted: false },
    });
    return users.map((user) => this.excludePassword(user));
  }

  async GetUserData(userId: string) {
    const userData = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userData || userData.isDeleted) {
      throw new NotFoundException('User not found');
    }

    return this.excludePassword(userData);
  }

  async UpdateUser(userId: string, payload: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser || existingUser.isDeleted) {
      throw new NotFoundException('User not found');
    }

    const updateData = { ...payload };

    if (payload.password) {
      const saltRounds = parseInt(process.env.SALT_ROUND ?? '10', 10);
      updateData.password = (await bcrypt.hash(payload.password, saltRounds)) as string;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return this.excludePassword(updatedUser);
  }

  async DeleteUser(userId: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser || existingUser.isDeleted) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return { message: 'User deleted successfully' };
  }
}