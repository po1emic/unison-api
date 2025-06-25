import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

import { JwtPayload, TypedRequest, ValidateResult } from '../types';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    const secretOrKey = process.env.JWT_REFRESH_SECRET;
    if (!secretOrKey) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }

    super({
      jwtFromRequest: (req: TypedRequest) => {
        return req.signedCookies?.refreshToken || null;
      },
      secretOrKey,
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  validate(req: TypedRequest, payload: JwtPayload): ValidateResult {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const refreshToken = req.signedCookies?.refreshToken;

    if (typeof refreshToken !== 'string' || !refreshToken) {
      throw new UnauthorizedException('Refresh token is missing or invalid');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      refreshToken,
    };
  }
}
