import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RefreshToken } from '../../models/RefreshToken';
import { ActivityService } from '../activity/activity.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private activityService: ActivityService,
        @Inject('KnexConnection') private readonly knex,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role_id || user.roleId
        };

        const accessToken = this.jwtService.sign(payload);
        const refreshToken = crypto.randomBytes(40).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        // Store refresh token
        await RefreshToken.query(this.knex).insert({
            token: refreshToken,
            user_id: user.id,
            expires_at: expiresAt.toISOString().slice(0, 19).replace('T', ' '),
        });

        await this.activityService.log(user.id, 'security', `User logged in: ${user.email}`);

        // Fetch full user data for response
        const fullUser = await this.usersService.findOne(user.id);

        return {
            token: accessToken, // Frontend expects 'token'
            refreshToken,
            user: fullUser,
        };
    }

    async signup(data: any) {
        const user = await this.usersService.create(data, null); // null adminId for self-signup
        return this.login(user);
    }

    async refreshToken(token: string) {
        const storedToken = await RefreshToken.query(this.knex)
            .findOne({ token })
            .withGraphFetched('user');

        if (!storedToken || new Date(storedToken.expires_at) < new Date()) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        const payload = {
            sub: storedToken.user.id,
            email: storedToken.user.email,
            role: storedToken.user.role_id
        };

        // Rotate refresh token
        const newRefreshToken = crypto.randomBytes(40).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await RefreshToken.query(this.knex).deleteById(storedToken.id);
        await RefreshToken.query(this.knex).insert({
            token: newRefreshToken,
            user_id: storedToken.user.id,
            expires_at: expiresAt.toISOString().slice(0, 19).replace('T', ' '),
        });

        return {
            token: this.jwtService.sign(payload),
            refreshToken: newRefreshToken,
        };
    }

    async logout(userId: number) {
        await RefreshToken.query(this.knex).delete().where('user_id', userId);
        await this.activityService.log(userId, 'security', 'User logged out');
        return { message: 'Logged out' };
    }
}
