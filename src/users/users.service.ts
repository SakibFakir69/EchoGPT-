
import { PrismaService } from "./../prisma/prisma.service.js"
import { Injectable } from '@nestjs/common';
import { Users } from './users.interface.js';
import { CreateUserDto } from "./dto/create-user.dto/create-user.dto.js";
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
     constructor(private prisma: PrismaService) {}
    

    async CreateUser (payload :CreateUserDto){

        const hashPassword = await bcrypt.hash(payload.password,process.env.SLAT_ROUND as string)

        const createUserData =await this.prisma.user.create({
            data:{
                ...payload, password:hashPassword
            }
        });
        return createUserData;

    }

}
