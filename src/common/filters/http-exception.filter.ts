import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      let msg: string;
      if (typeof body === 'string') {
        msg = body;
      } else {
        const message = (body as { message?: string | string[] }).message;
        msg = Array.isArray(message) ? message[0] : message ?? exception.message;
      }
      if (status === HttpStatus.UNAUTHORIZED && msg === 'Unauthorized') {
        msg = '未登录或登录已过期';
      }
      response.status(status).json({ code: -1, data: null, msg });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: -1,
      data: null,
      msg: '服务器内部错误',
    });
  }
}
