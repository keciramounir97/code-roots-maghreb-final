import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'objection';
import { ActivityLog } from '../../models/ActivityLog';

@Injectable()
export class ActivityService {
    constructor(@Inject('KnexConnection') private readonly knex) { }

    async log(userId: number | null, type: string, description: string) {
        try {
            await ActivityLog.query(this.knex).insert({
                actor_user_id: userId,
                type,
                description,
            });
        } catch (err) {
            console.error('Failed to log activity:', err.message);
            // Don't crash request if logging fails
        }
    }
}
