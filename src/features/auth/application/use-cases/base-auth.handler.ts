import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BaseAuthPayload } from '../../../../constants';

export class BaseAuthCommand {
  constructor(public readonly token: string) {}
}

@CommandHandler(BaseAuthCommand)
export class BaseAuthHandler implements ICommandHandler<BaseAuthCommand> {
  async execute({ token }: BaseAuthCommand): Promise<boolean> {
    const decodedBaseData = await this.decodeBaseAuth(token);

    const baseAuthPayload = await this.getBaseAuthUser();

    if (
      decodedBaseData.login !== baseAuthPayload.login ||
      decodedBaseData.password !== baseAuthPayload.password
    ) {
      return false;
    }

    return true;
  }

  private async decodeBaseAuth(token: string) {
    const buff = Buffer.from(token, 'base64');

    const decodedString = buff.toString('ascii');

    const loginAndPassword = decodedString.split(':');

    return {
      login: loginAndPassword[0],
      password: loginAndPassword[1],
    };
  }

  private async getBaseAuthUser() {
    return BaseAuthPayload;
  }
}
