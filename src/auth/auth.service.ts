import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import { hash, compare } from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signUp(dto: AuthDto) {
    //generate the password hash
    const passwordHash = await hash(
      dto.password,
      8,
    );

    try {
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
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Credentials Taken',
          );
        }
      }
      throw error;
    }
  }

  async signIn(dto: AuthDto) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

    if (!user)
      throw new ForbiddenException(
        'Credentials Incorrect',
      );

    const passwordMatch = await compare(
      dto.password,
      user.hash,
    );

    if (!passwordMatch)
      throw new ForbiddenException(
        'Credentials Incorrect',
      );

    delete user.hash;

    return user;
  }
}
