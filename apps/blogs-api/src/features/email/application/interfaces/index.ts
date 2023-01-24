export interface ISendConfirmationCodeCommand {
  email: string;
  userName: string;
  confirmationCode: string;
}

export interface ISendRecoveryPasswordTempCodeCommand {
  email: string;
  userName: string;
  recoveryCode: string;
}

export interface ISendTestEmailCommand {
  email: string;
  userName: string;
}
