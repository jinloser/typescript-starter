import { IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MinLength(2, { message: '角色名至少 2 个字符' })
  @MaxLength(50)
  name: string;

  @IsString()
  @MinLength(2, { message: '角色编码至少 2 个字符' })
  @MaxLength(50)
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsInt()
  status?: number;
}
