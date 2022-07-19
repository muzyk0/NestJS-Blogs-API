export interface MailType {
  from: string; // sender address
  to: string; // list of receivers
  subject: string; // Subject line
  text?: string; // plain text body
  html: string; // html body
}
