import { SecurityViewModel } from '../../application/dto/security.dto';

export abstract class ISecurityQueryRepository {
  abstract findAll(userId: string): Promise<SecurityViewModel[]>;
}
