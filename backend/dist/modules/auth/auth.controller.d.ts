import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { RequestResetDto } from './dto/request-reset.dto';
import { VerifyResetDto } from './dto/verify-reset.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        token: string;
        refreshToken: string;
        user: any;
    }>;
    signup(signupDto: SignupDto): Promise<{
        token: string;
        refreshToken: string;
        user: any;
    }>;
    refresh(body: {
        refreshToken?: string;
    }): Promise<{
        token: string;
        refreshToken: string;
    }>;
    verifyReset(dto: VerifyResetDto): Promise<{
        message: string;
    }>;
    requestReset(dto: RequestResetDto): Promise<{
        message: string;
        code?: undefined;
    } | {
        message: string;
        code: string;
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
    me(req: any): Promise<any>;
}
