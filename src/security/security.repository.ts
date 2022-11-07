import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SecurityDto } from './dto/security.dto';
import { UpdateSecurityDto } from './dto/update-security.dto';
import { Security, SecurityDocument } from './schemas/security.schema';

@Injectable()
export class SecurityRepository {
  constructor(
    @InjectModel(Security.name) private securityModel: Model<SecurityDocument>,
  ) {}

  create(securityDto: SecurityDto) {
    return this.securityModel.create(securityDto);
  }

  findAll() {
    return `This action returns all security`;
  }

  findOne(id: number) {
    return `This action returns a #${id} security`;
  }

  update(id: number, updateSecurityDto: UpdateSecurityDto) {
    return `This action updates a #${id} security`;
  }

  remove(id: number) {
    return `This action removes a #${id} security`;
  }
}
