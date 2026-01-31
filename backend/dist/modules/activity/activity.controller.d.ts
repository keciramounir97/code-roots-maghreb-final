import { ActivityService } from './activity.service';
export declare class ActivityController {
    private readonly activityService;
    constructor(activityService: ActivityService);
    getActivities(limit: number): Promise<import("../../models/ActivityLog").ActivityLog[]>;
}
