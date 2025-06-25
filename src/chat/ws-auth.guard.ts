/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = client.data?.userId;

    if (!userId) {
      throw new WsException('Unauthorized');
    }
    return true;
  }
}
