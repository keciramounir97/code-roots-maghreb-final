import { ActivityLog } from '../../models/ActivityLog';
export declare class ActivityService {
    private readonly knex;
    constructor(knex: any);
    log(userId: number | null, type: string, description: string): Promise<void>;
    findAll(limit?: number): Promise<ActivityLog[]>;
}
