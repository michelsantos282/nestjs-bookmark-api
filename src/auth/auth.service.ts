import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import { hash } from 'bcrypt';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signUp(dto: AuthDto) {
    //generate the password hash
    const passwordHash = await hash(
      dto.password,
      8,
    );

    //save the new user in the db
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash: passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
    //return the saved user
    return user;
  }
}
