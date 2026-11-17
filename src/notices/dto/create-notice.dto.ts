import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateNoticeDto {
  @IsString()
  @MinLength(1, { message: '公告标题至少 1 个字符' })
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(1, { message: '公告内容至少 1 个字符' })
  content: string;

  @IsOptional()
  @IsIn([0, 1])
  status?: number;
}
