export interface ConfirmEmail {
  userName: string;
  confirmationCode: string;
}
export interface RecoveryEmail {
  userName: string;
  recoveryCode: string;
}
