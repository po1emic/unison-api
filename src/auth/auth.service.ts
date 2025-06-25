import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AccessToken, VideoGrant } from 'livekit-server-sdk';
import { User } from 'prisma/client';

import { DatabaseService } from '@/database/database.service';
import { UserService } from '@/user/user.service';

import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly db: DatabaseService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(user: User) {
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async signUp(dto: SignUpDto) {
    const user = await this.userService.findOne({ email: dto.email });
    if (user) throw new ConflictException();

    const newUser = await this.userService.create(dto);
    return this.signIn(newUser);
  }

  async logOut(id: string) {
    await this.db.user.updateMany({
      where: { id, refreshToken: { not: null } },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  }

  async refreshTokens(userId: string, token: string) {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const verified = await argon2.verify(token, user.refreshToken);
    if (!verified) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  private async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
          issuer: this.configService.get('JWT_ISSUER'),
          audience: this.configService.get('JWT_AUDIENCE'),
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
          issuer: this.configService.get('JWT_ISSUER'),
          audience: this.configService.get('JWT_AUDIENCE'),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedToken = await argon2.hash(refreshToken);
    await this.db.user.update({
      where: { id: userId },
      data: { refreshToken: hashedToken },
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findOne({ email });
    if (!user) return null;

    const verified = await argon2.verify(user.passwordHash, password);
    if (!verified) return null;

    const { passwordHash: _, refreshToken: __, ...rest } = user;
    return rest;
  }

  async createToken(roomName: string, identity: string): Promise<string> {
    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity, ttl: '1h' },
    );

    const videoGrant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    };
    token.addGrant(videoGrant);

    return await token.toJwt();
  }
}
