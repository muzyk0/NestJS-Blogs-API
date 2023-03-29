import { BaseAuthHandler } from './base-auth.handler';
import { ConfirmAccountHandler } from './confirm-account.handler';
import { ConfirmPasswordRecoveryHandler } from './confirm-password-recovery.handler';
import { LoginHandler } from './login.handler';
import { LogoutHandler } from './logout.handler';
import { RefreshTokenHandler } from './refresh-token.handler';
import { ResendConfirmationCodeHandler } from './resend-confirmation-code.handler';
import { SendRecoveryPasswordTempCodeHandler } from './send-recovery-password-temp-code.handler';
import { ValidateUserHandler } from './validate-user.handler';

export const CommandHandlers = [
  ConfirmPasswordRecoveryHandler,
  LoginHandler,
  SendRecoveryPasswordTempCodeHandler,
  ConfirmAccountHandler,
  BaseAuthHandler,
  ConfirmPasswordRecoveryHandler,
  ResendConfirmationCodeHandler,
  ValidateUserHandler,
  LogoutHandler,
  RefreshTokenHandler,
];
