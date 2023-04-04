import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { IUsersRepository } from '../application/application/users-repository.abstract-class';
import { UpdateConfirmationType } from '../application/interfaces/users.interface';
import { User } from '../domain/entities/user.entity';

import { CreateUserInput } from './dto/create-user.input';

@Injectable()
export class UsersSqlRepository implements IUsersRepository {
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

  async findOneByConfirmationCode(code: string): Promise<User | null> {
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

  async findOneByEmail(email: string): Promise<User | null> {
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

  async findOneByLogin(login: string): Promise<User | null> {
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

  async findOneByLoginOrEmailWithoutBanned(
    loginOrEmail: string,
  ): Promise<User | null> {
    const users = await this.dataSource.query(
      `
          SELECT u.*
          FROM "users" as u
                   left join bans as b on b."userId" = u.id
          WHERE (u."login" = $1
              OR u."email" = $1)
            AND b.banned IS NULL
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
