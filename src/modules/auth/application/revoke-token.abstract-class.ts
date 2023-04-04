import { RevokeTokenInput } from './dto/revoke-token.input';

export abstract class IRevokeTokenRepository {
  abstract checkRefreshTokenInBlackList(
    id: string,
    revokeToken: RevokeTokenInput,
  ): Promise<boolean>;

  abstract revokeRefreshToken(
    id: string,
    revokeToken: RevokeTokenInput,
  ): Promise<boolean>;
}
