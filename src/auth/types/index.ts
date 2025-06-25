import { User } from 'prisma/client';

type JwtPayload = { sub: string } & Omit<User, 'passwordHash' | 'id'>;

interface ValidateResult {
  sub: string;
  email: string;
  refreshToken: string;
}

interface TypedRequest extends Request {
  cookies: Record<string, string>;
  signedCookies: Record<string, string>;
}

export { JwtPayload, TypedRequest, ValidateResult };
