import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { IUsersRepository } from '../application/application/users-repository.abstract-class';
import { UpdateConfirmationType } from '../application/interfaces/users.interface';
import { User } from '../domain/entities/user.entity';

import { CreateUserInput } from './dto/create-user.input';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async create({
    login,
    email,
    password,
    confirmationCode,
    expirationDate,
    isConfirmed,
  }: CreateUserInput): Promise<User> {
    const user = this.usersRepo.create({
      login,
      email,
      password,
      confirmationCode,
      expirationDate,
      isConfirmed,
    });

    return this.usersRepo.save(user);
  }

  async findOneByConfirmationCode(code: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: {
        confirmationCode: code,
      },
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: {
        email,
      },
    });
  }

  async findOneByLogin(login: string): Promise<User> {
    return this.usersRepo.findOne({
      where: {
        login,
      },
    });
  }

  async findOneById(id: string): Promise<User | null> {
    return this.usersRepo.findOneById(id);
  }

  async findOneByLoginOrEmailWithoutBanned(
    loginOrEmail: string,
  ): Promise<User> {
    return this.usersRepo.findOne({
      where: [{ login: loginOrEmail }, { email: loginOrEmail }],
      relations: {
        bans: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          banned: IsNull(),
        },
      },
    });
  }

  async remove(id: string): Promise<boolean> {
    const user = await this.usersRepo.findOneById(id);

    if (!user) {
      return false;
    }

    await this.usersRepo.delete(user);
    return true;
  }

  async setIsConfirmedById(id: string): Promise<boolean> {
    const result = await this.usersRepo.update({ id }, { isConfirmed: true });

    if (result.affected) {
      return true;
    }
    return false;
  }

  async updateConfirmationCode({
    id,
    code,
    expirationDate,
  }: UpdateConfirmationType): Promise<User> {
    const result = await this.usersRepo.update(
      { id },
      { confirmationCode: code, expirationDate },
    );

    if (result.affected) {
      return this.usersRepo.findOneById(id);
    }
    return null;
  }

  async updateUserPassword({
    password,
    id,
  }: {
    password: string;
    id: string;
  }): Promise<boolean> {
    const user = await this.usersRepo.findOneById(id);

    if (!user) {
      return false;
    }

    user.password = password;

    await this.usersRepo.save(user);

    return true;
  }
}
