import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { CreateUserDto } from '../../src/modules/users/application/dto/create-user.dto';
import { UserViewModel } from '../../src/modules/users/infrastructure/dto/user.view';
import '../jest/toBeTypeOrNull';

export abstract class FakeUser {
  abstract user: UserViewModel | null;
  abstract credentials: CreateUserDto | null;
  abstract accessToken: string | null;

  static checkViewDto(user: UserViewModel | null) {
    expect(user).toEqual({
      id: expect.any(String),
      login: expect.any(String),
      email: expect.any(String),
      createdAt: expect.any(String),
      banInfo: {
        isBanned: expect.any(Boolean),
        banDate: expect.toBeTypeOrNull(String),
        banReason: expect.toBeTypeOrNull(String),
      },
    });
  }
}

export class FakeUserBuilder {
  private user: UserViewModel | null = null;
  private credentials: CreateUserDto | null = null;
  private token: string | null = null;

  private setting: {
    isUserCanBeCreated: boolean;
    isLogged: boolean;
  };

  constructor(private readonly app: INestApplication) {
    this.setting = {
      isUserCanBeCreated: false,
      isLogged: false,
    };
  }

  create(createUserDto?: Partial<CreateUserDto>) {
    this.credentials = {
      login: createUserDto?.login ?? faker.internet.userName().slice(0, 10),
      password: createUserDto?.password ?? faker.internet.password(),
      email: createUserDto?.email ?? faker.internet.email(),
    };

    this.setting.isUserCanBeCreated = true;

    return this;
  }

  login() {
    this.setting.isLogged = true;
    return this;
  }

  async build(): Promise<FakeUser> {
    if (this.setting.isUserCanBeCreated) {
      await this._create();
    }

    if (this.setting.isLogged) {
      await this._login();
    }

    return {
      user: this.user,
      credentials: this.credentials,
      accessToken: this.token,
    };
  }

  private async _create() {
    const response00 = await request(this.app.getHttpServer())
      .post(`/sa/users`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(this.credentials!)
      .expect(201);

    this.user = response00.body;
  }

  private async _login() {
    const responseToken = await request(this.app.getHttpServer())
      .post(`/auth/login`)
      .set(`User-Agent`, `for test`)
      .send({
        loginOrEmail: this.credentials!.login,
        password: this.credentials!.password,
      })
      .expect(200);
    this.token = responseToken.body.accessToken;
  }
}
