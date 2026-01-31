import { User } from '../../models/User';
import { ActivityService } from '../activity/activity.service';
export declare class UsersService {
    private readonly knex;
    private readonly activityService;
    constructor(knex: any, activityService: ActivityService);
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<any>;
    findByEmail(email: string): Promise<User>;
    create(data: any, adminId: number | null): Promise<User>;
    update(id: number, data: any, adminId: number): Promise<{
        message: string;
    }>;
    delete(id: number, adminId: number): Promise<{
        message: string;
    }>;
}
