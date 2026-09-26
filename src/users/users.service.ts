
import { PrismaService } from "./../prisma/prisma.service.js"
import { BadRequestException, Injectable } from '@nestjs/common';
import { Users } from './users.interface.js';
import { CreateUserDto } from "./dto/create-user.dto/create-user.dto.js";
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
     constructor(private prisma: PrismaService) {}
    

    async CreateUser (payload :CreateUserDto){

        const isAlreadyEmailExits = await this.prisma.user.findUnique({
            where:{
                email:payload.email
            }
        })
        if(isAlreadyEmailExits) {
            throw new BadRequestException(`You have already created account`)
        }
        const saltRounds = parseInt(process.env.SALT_ROUND ?? '10', 10);

        const hashPassword = await bcrypt.hash(payload.password,saltRounds) as string;

        const createUserData =await this.prisma.user.create({
            data:{
                ...payload, password:hashPassword
            }
        });
        return createUserData;

    }

}
