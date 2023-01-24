import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BaseAuthPayload } from '../../../../constants';

export class BaseAuthCommand {
  constructor(public readonly token: string) {}
}

@CommandHandler(BaseAuthCommand)
export class BaseAuthHandler implements ICommandHandler<BaseAuthCommand> {
  async execute({ token }: BaseAuthCommand): Promise<boolean> {
    const decodedBaseAuthPayload = await this.decodeBaseAuth(token);

    return this.isAuthorizationAllowed(decodedBaseAuthPayload);
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

  private isAuthorizationAllowed(decodedBaseAuthPayload) {
    if (
      decodedBaseAuthPayload.login !== BaseAuthPayload.login ||
      decodedBaseAuthPayload.password !== BaseAuthPayload.password
    ) {
      return false;
    }

    return true;
  }
}
