import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async generateToken(user: any) {
    const payload = { 
      sub: user.id, 
      username: user.username, 
      role: user.residenceStatus 
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}