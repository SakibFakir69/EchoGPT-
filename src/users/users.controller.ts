import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto/update-user.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage('User created successfully')
  CreateUser(@Body() payload: CreateUserDto) {
    return this.usersService.CreateUser(payload);
  }

  @UseGuards(AuthGuard)
  @Get()
  @ResponseMessage('Users fetched successfully')
  GetAllUsers() {
    return this.usersService.GetAllUsers();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ResponseMessage('User fetched successfully')
  GetUserData(@Param('id') id: string) {
    return this.usersService.GetUserData(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ResponseMessage('User updated successfully')
  UpdateUser(@Param('id') id: string, @Body() payload: UpdateUserDto) {
    return this.usersService.UpdateUser(id, payload);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ResponseMessage('User deleted successfully')
  DeleteUser(@Param('id') id: string) {
    return this.usersService.DeleteUser(id);
  }
}