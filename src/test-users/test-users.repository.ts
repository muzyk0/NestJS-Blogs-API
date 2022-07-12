import { Injectable } from '@nestjs/common';

@Injectable()
export class TestUsersRepository {
  findUsers(term: string) {
    return [
      { id: 1, name: 'Dimych' },
      { id: 2, name: 'Vlad' },
    ].filter((u) => (!term ? u : u.name.includes(term)));
  }
}
