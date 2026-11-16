import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** 取当前登录用户（JwtAuthGuard 写入的 req.user），可传字段名取单个字段 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
