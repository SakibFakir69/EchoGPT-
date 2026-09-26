
import { PrismaService } from "./../prisma/prisma.service.js"
import { Injectable } from '@nestjs/common';
import { Users } from './users.interface.js';


@Injectable()
export class UsersService {
     constructor(private prisma: PrismaService) {}
    

    async CreateUser (payload : Partial<Users>){

        const createUserData =await this.prisma.user.create({
            data:payload
        });



    }

}
