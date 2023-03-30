import { BlogExistsRule } from './check-blogId-if-exist.decorator';
import { EmailNotExistRule } from './check-is-email-exist.decorator';
import { LoginNotExistRule } from './check-is-login-exist.decorator';
import { IsUserAlreadyExistConstraint } from './check-is-user-exist.decorator';

export const validatorsConstraints = [
  IsUserAlreadyExistConstraint,
  LoginNotExistRule,
  EmailNotExistRule,
  BlogExistsRule,
];
