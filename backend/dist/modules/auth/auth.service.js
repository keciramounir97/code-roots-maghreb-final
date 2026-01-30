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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const RefreshToken_1 = require("../../models/RefreshToken");
const activity_service_1 = require("../activity/activity.service");
const crypto = require("crypto");
let AuthService = class AuthService {
    constructor(usersService, jwtService, activityService, knex) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.activityService = activityService;
        this.knex = knex;
    }
    async validateUser(email, pass) {
        const user = await this.usersService.findByEmail(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password } = user, result = __rest(user, ["password"]);
            return result;
        }
        return null;
    }
    async login(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role_id || user.roleId
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = crypto.randomBytes(40).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await RefreshToken_1.RefreshToken.query(this.knex).insert({
            token: refreshToken,
            user_id: user.id,
            expires_at: expiresAt.toISOString().slice(0, 19).replace('T', ' '),
        });
        await this.activityService.log(user.id, 'security', `User logged in: ${user.email}`);
        const fullUser = await this.usersService.findOne(user.id);
        return {
            token: accessToken,
            refreshToken,
            user: fullUser,
        };
    }
    async signup(data) {
        const user = await this.usersService.create(data, null);
        return this.login(user);
    }
    async refreshToken(token) {
        const storedToken = await RefreshToken_1.RefreshToken.query(this.knex)
            .findOne({ token })
            .withGraphFetched('user');
        if (!storedToken || new Date(storedToken.expires_at) < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const payload = {
            sub: storedToken.user.id,
            email: storedToken.user.email,
            role: storedToken.user.role_id
        };
        const newRefreshToken = crypto.randomBytes(40).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await RefreshToken_1.RefreshToken.query(this.knex).deleteById(storedToken.id);
        await RefreshToken_1.RefreshToken.query(this.knex).insert({
            token: newRefreshToken,
            user_id: storedToken.user.id,
            expires_at: expiresAt.toISOString().slice(0, 19).replace('T', ' '),
        });
        return {
            token: this.jwtService.sign(payload),
            refreshToken: newRefreshToken,
        };
    }
    async logout(userId) {
        await RefreshToken_1.RefreshToken.query(this.knex).delete().where('user_id', userId);
        await this.activityService.log(userId, 'security', 'User logged out');
        return { message: 'Logged out' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)('KnexConnection')),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        activity_service_1.ActivityService, Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map