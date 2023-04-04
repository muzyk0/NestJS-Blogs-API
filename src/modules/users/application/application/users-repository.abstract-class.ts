import { User } from '../../domain/entities/user.entity';
import { CreateUserInput } from '../../infrastructure/dto/create-user.input';
import { UpdateConfirmationType } from '../interfaces/users.interface';

export abstract class IUsersRepository {
  abstract create(createUserDto: CreateUserInput): Promise<User>;

  abstract findOneByLoginOrEmailWithoutBanned(
    loginOrEmail: string,
    withBanned?: false,
  ): Promise<User>;

  abstract findOneByEmail(email: string): Promise<User | null>;

  abstract findOneByConfirmationCode(code: string): Promise<User | null>;

  abstract findOneById(id: string): Promise<User | null>;

  abstract findOneByLogin(login: string): Promise<User | null>;

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
}
