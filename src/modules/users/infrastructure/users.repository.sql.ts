import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { BanUnbanUserInput } from '../application/dto/ban-unban-user.input';
import { UpdateConfirmationType } from '../application/interfaces/users.interface';
import { User } from '../domain/entities/user.entity';

import { CreateUserInput } from './dto/create-user.input';

export abstract class IUsersRepository {
  abstract create(createUserDto: CreateUserInput): Promise<User>;

  abstract findOneByLoginOrEmail(
    loginOrEmail: string,
    withBanned?: false,
  ): Promise<User>;

  abstract findOneByEmail(email: string): Promise<User>;

  abstract findOneByConfirmationCode(code: string): Promise<User>;

  abstract findOneById(id: string): Promise<User | null>;

  abstract findOneByLogin(login: string): Promise<User>;

  abstract findManyByIds(ids: string[]): Promise<User[]>;

  abstract remove(id: string): Promise<boolean>;

  abstract setIsConfirmedById(id: string): Promise<boolean>;

  abstract updateConfirmationCode({
    id,
    code,
    expirationDate,
  }: UpdateConfirmationType): Promise<User>;

  abstract updateUserPassword({
    password,
    id,
  }: {
    password: string;
    id: string;
  }): Promise<boolean>;

  abstract updateBan(id: string, payload: BanUnbanUserInput): Promise<boolean>;

  abstract findAllWithoutBanned(): Promise<User[]>;
}

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async create({
    login,
    email,
    password,
    confirmationCode,
    expirationDate,
    isConfirmed,
  }: CreateUserInput): Promise<User> {
    const query = `INSERT INTO "users"
                   (login, email, "password", "confirmationCode", "expirationDate", "isConfirmed")
                   VALUES ($1, $2, $3, $4, $5, $6)
                   RETURNING *;`;

    const result: User[] = await this.dataSource.query(query, [
      login,
      email,
      password,
      confirmationCode,
      expirationDate,
      isConfirmed,
    ]);

    return result[0];
  }

  async findAllWithoutBanned(): Promise<User[]> {
    const users: User[] = await this.dataSource.query(`
        SELECT *
        FROM "users"
        WHERE banned IS NULL
    `);
    return users;
  }

  async findManyByIds(ids: string[]): Promise<User[]> {
    const users: User[] = await this.dataSource.query(
      `
          SELECT *
          FROM "users"
          WHERE id IN ($1)
      `,
      [ids],
    );
    return users;
  }

  async findOneByConfirmationCode(code: string): Promise<User> {
    const users: User[] = await this.dataSource.query(
      `
          SELECT *
          FROM "users"
          WHERE "confirmationCode" = $1
      `,
      [code],
    );
    return users[0];
  }

  async findOneByEmail(email: string): Promise<User> {
    const users: User[] = await this.dataSource.query(
      `
          SELECT *
          FROM "users"
          WHERE "email" = $1
      `,
      [email],
    );
    return users[0];
  }

  async findOneByLogin(login: string): Promise<User> {
    const users: User[] = await this.dataSource.query(
      `
          SELECT *
          FROM "users"
          WHERE "login" = $1
      `,
      [login],
    );
    return users[0];
  }

  async findOneById(id: string): Promise<User | null> {
    const users: User[] = await this.dataSource.query(
      `
          SELECT *
          FROM "users"
          WHERE "id" = $1
      `,
      [id],
    );
    return users[0];
  }

  async findOneByLoginOrEmail(
    loginOrEmail: string,
    withBanned?: boolean,
  ): Promise<User> {
    const users: User[] = await this.dataSource.query(
      `
          SELECT *
          FROM "users"
          WHERE ("login" = $1
              OR "email" = $1)
              ${withBanned ? '' : 'AND "banned" IS NULL'}
      `,
      [loginOrEmail],
    );
    return users[0];
  }

  async remove(id: string): Promise<boolean> {
    await this.dataSource.query(
      `
          DELETE
          FROM "users"
          WHERE id = $1
      `,
      [id],
    );
    return true;
  }

  async setIsConfirmedById(id: string): Promise<boolean> {
    await this.dataSource.query(
      `
          UPDATE "users"
          SET "isConfirmed" = true
          WHERE id = $1
      `,
      [id],
    );
    return true;
  }

  async updateBan(id: string, payload: BanUnbanUserInput): Promise<boolean> {
    const banned = payload.isBanned ? new Date() : null;
    const banReason = payload.isBanned ? payload.banReason : null;
    await this.dataSource.query(
      `
          UPDATE "users"
          SET "banned"    = $2,
              "banReason" = $3
          WHERE id = $1
          RETURNING *
      `,
      [id, banned, banReason],
    );
    return true;
  }

  async updateConfirmationCode({
    id,
    code,
    expirationDate,
  }: UpdateConfirmationType): Promise<User> {
    const users = await this.dataSource.query(
      `
          UPDATE "users"
          SET "confirmationCode" = $2,
              "expirationDate"   = $3
          WHERE id = $1
          RETURNING "confirmationCode"
      `,
      [id, code, expirationDate],
    );

    return users[0][0];
  }

  async updateUserPassword({
    password,
    id,
  }: {
    password: string;
    id: string;
  }): Promise<boolean> {
    await this.dataSource.query(
      `
          UPDATE "users"
          SET "password" = $2
          WHERE id = $1
      `,
      [id, password],
    );
    return true;
  }
}
