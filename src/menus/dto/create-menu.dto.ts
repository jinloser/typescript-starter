import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateMenuDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  parentId?: number = 0;

  @IsString()
  @MaxLength(50)
  name: string;

  @IsIn(['dir', 'menu', 'button'])
  type: 'dir' | 'menu' | 'button';

  @IsOptional()
  @IsString()
  @MaxLength(200)
  path?: string = '';

  @IsOptional()
  @IsString()
  @MaxLength(200)
  component?: string = '';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  permission?: string = '';

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string = '';

  @IsOptional()
  @IsInt()
  @Min(0)
  sort?: number = 0;

  @IsOptional()
  @IsInt()
  status?: number = 1;
}
