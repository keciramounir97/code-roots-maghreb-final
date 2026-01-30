import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        token: string;
        refreshToken: string;
        user: import("../../models/User").User;
    }>;
    signup(signupDto: SignupDto): Promise<{
        token: string;
        refreshToken: string;
        user: import("../../models/User").User;
    }>;
    refresh(body: {
        refreshToken: string;
    }): Promise<{
        token: string;
        refreshToken: string;
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
    me(req: any): Promise<any>;
}
