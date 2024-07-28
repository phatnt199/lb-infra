"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTAuthenticationStrategy = void 0;
const common_1 = require("../../../common");
const core_1 = require("@loopback/core");
const jwt_token_service_1 = require("./jwt-token.service");
let JWTAuthenticationStrategy = class JWTAuthenticationStrategy {
    constructor(service) {
        this.service = service;
        this.name = common_1.Authentication.STRATEGY_JWT;
    }
    authenticate(request) {
        const token = this.service.extractCredentials(request);
        return Promise.resolve(this.service.verify(token));
    }
};
exports.JWTAuthenticationStrategy = JWTAuthenticationStrategy;
exports.JWTAuthenticationStrategy = JWTAuthenticationStrategy = __decorate([
    __param(0, (0, core_1.inject)('services.JWTTokenService')),
    __metadata("design:paramtypes", [jwt_token_service_1.JWTTokenService])
], JWTAuthenticationStrategy);
//# sourceMappingURL=jwt.strategy.js.map