import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<import("../../models/User").User[]>;
    findOne(id: number): Promise<any>;
    create(body: CreateUserDto, req: any): Promise<import("../../models/User").User>;
    update(id: number, body: UpdateUserDto, req: any): Promise<{
        message: string;
    }>;
    delete(id: number, req: any): Promise<{
        message: string;
    }>;
}
