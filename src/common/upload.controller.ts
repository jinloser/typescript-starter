import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';

import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

// mimetype → 扩展名白名单：扩展名由 mimetype 推导，不信用户传的文件名
const MIME_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads', // 自动创建目录，相对项目根
        filename: (_req, file, cb) =>
          cb(null, `${randomUUID()}${MIME_EXT[file.mimetype] ?? ''}`),
      }),
      fileFilter: (_req, file, cb) => {
        if (MIME_EXT[file.mimetype]) cb(null, true);
        else cb(new BadRequestException('只支持 jpg/png/webp 图片'), false);
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('请选择要上传的文件');
    return { url: `/uploads/${file.filename}` };
  }
}
