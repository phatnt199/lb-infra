import { Authentication } from '@/common';
import { AuthenticationStrategy } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { Request } from '@loopback/rest';
import { JWTTokenService } from './jwt-token.service';

export class JWTAuthenticationStrategy implements AuthenticationStrategy {
  name = Authentication.STRATEGY_JWT;

  constructor(@inject('services.JWTTokenService') private service: JWTTokenService) {}

  authenticate(request: Request) {
    const token = this.service.extractCredentials(request);
    return Promise.resolve(this.service.verify(token));
  }
}
