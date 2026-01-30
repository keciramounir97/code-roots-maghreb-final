import { BaseModel } from './BaseModel';
import { Model } from 'objection';

export class ActivityLog extends BaseModel {
    static tableName = 'activity_logs';

    id!: number;
    actor_user_id?: number;
    type!: string;
    description!: string;

    actor?: import('./User').User;
    // created_at inherited from BaseModel (but no updated_at for logs usually, handled by base model still fine)

    static jsonSchema = {
        type: 'object',
        required: ['type', 'description'],
        properties: {
            id: { type: 'integer' },
            actor_user_id: { type: ['integer', 'null'] },
            type: { type: 'string' },
            description: { type: 'string' },
        },
    };

    static relationMappings = () => ({
        actor: {
            relation: Model.BelongsToOneRelation,
            modelClass: require('./User').User,
            join: {
                from: 'activity_logs.actor_user_id',
                to: 'users.id',
            },
        },
    });
}
