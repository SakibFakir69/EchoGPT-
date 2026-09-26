import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../create-user.dto/create-user.dto.js';


export class UpdateUserDto extends PartialType(CreateUserDto) {}