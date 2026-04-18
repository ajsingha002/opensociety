import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'superSecretKey', // Use an environment variable in production
    });
  }

  async validate(payload: any) {
    if (!payload) throw new UnauthorizedException();
    return { sub: payload.sub, username: payload.username, role: payload.role };
  }
}