import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto.js';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  /** 密码缺省时不修改 */
  password?: string;
}
