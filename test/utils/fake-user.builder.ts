import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { CreateUserDto } from '../../src/modules/users/application/dto/create-user.dto';
import { UserViewModel } from '../../src/modules/users/application/dto/user.view';

export interface FakeUser {
  user: UserViewModel | null;
  credentials: CreateUserDto | null;
  accessToken: string | null;
}

export class FakeUserBuilder {
  private user: UserViewModel = null;
  private credentials: CreateUserDto = null;
  private token: string = null;

  private setting: {
    isLogged: boolean;
  };

  constructor(private readonly app: INestApplication) {
    this.setting = {
      isLogged: false,
    };
  }

  create() {
    this.credentials = {
      login: faker.internet.userName().slice(0, 10),
      password: faker.internet.password(),
      email: faker.internet.email(),
    };

    return this;
  }

  login() {
    this.setting.isLogged = true;
    return this;
  }

  async build(): Promise<FakeUser> {
    if (!this.user) {
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
      .send(this.credentials)
      .expect(201);

    this.user = response00.body;
  }

  private async _login() {
    const responseToken = await request(this.app.getHttpServer())
      .post(`/auth/login`)
      .set(`User-Agent`, `for test`)
      .send({
        loginOrEmail: this.credentials.login,
        password: this.credentials.password,
      })
      .expect(200);
    this.token = responseToken.body.accessToken;
  }
}
