/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Message } from 'prisma/client';
import { Server, Socket } from 'socket.io';

import { DatabaseService } from '@/database/database.service';
import { UserService } from '@/user/user.service';

@WebSocketGateway({
  namespace: '/ws/chat',
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: '/ws/socket.io',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private db: DatabaseService,
  ) {}

  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    console.log('Chat WebSocket Gateway initialized', server);
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findOne({ id: payload.sub });

      if (!user) {
        client.disconnect();
        return;
      }

      const channelId = client.handshake.query.channelId as string;
      if (!channelId) {
        client.disconnect();
        return;
      }

      const channel = await this.db.channel.findUnique({
        where: { id: channelId },
        include: { community: true },
      });

      if (!channel) {
        client.disconnect();
        return;
      }

      const isMember = await this.db.member.findUnique({
        where: {
          userId_communityId: {
            userId: user.id,
            communityId: channel.communityId,
          },
        },
      });

      if (!isMember) {
        client.disconnect();
        return;
      }

      client.join(`channel_${channelId}`);
      console.log(`Client connected to channel ${channelId}: ${user.email}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected', client);
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: Omit<Message, 'id' | 'sentAt'>) {
    try {
      const newMessage = await this.db.message.create({
        data: {
          content: payload.content,
          userId: payload.userId,
          channelId: payload.channelId,
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      if (this.server) {
        this.server
          .to(`channel_${payload.channelId}`)
          .emit('message', newMessage);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }
}
