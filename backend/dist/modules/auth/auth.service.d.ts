import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ActivityService } from '../activity/activity.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private activityService;
    private readonly knex;
    constructor(usersService: UsersService, jwtService: JwtService, activityService: ActivityService, knex: any);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        token: string;
        refreshToken: string;
        user: import("../../models/User").User;
    }>;
    signup(data: any): Promise<{
        token: string;
        refreshToken: string;
        user: import("../../models/User").User;
    }>;
    refreshToken(token: string): Promise<{
        token: string;
        refreshToken: string;
    }>;
    logout(userId: number): Promise<{
        message: string;
    }>;
}
