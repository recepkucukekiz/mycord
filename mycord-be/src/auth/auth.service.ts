import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'entities/user.entity';
import { Repository } from 'typeorm';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  getUserById(id: string): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        id,
      },
    });
  }

  async login(user: LoginDto): Promise<string> {
    const matchUser = await this.usersRepository.findOne({
      where: {
        email: user.email,
        password: user.password,
      },
    });

    if (!matchUser) {
      throw new Error('Invalid email or password');
    }

    const token = this.jwtService.sign(
      {
        id: matchUser.id,
        email: matchUser.email,
      },
      {
        expiresIn: '1d',
        secret: 'secret',
      },
    );

    return token;
  }

  register(user: RegisterDto): Promise<User> {
    return this.usersRepository.save(user);
  }
}
