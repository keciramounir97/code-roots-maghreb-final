import { BaseModel } from './BaseModel';
export declare class ActivityLog extends BaseModel {
    static tableName: string;
    id: number;
    actor_user_id?: number;
    type: string;
    description: string;
    actor?: import('./User').User;
    static jsonSchema: {
        type: string;
        required: string[];
        properties: {
            id: {
                type: string;
            };
            actor_user_id: {
                type: string[];
            };
            type: {
                type: string;
            };
            description: {
                type: string;
            };
        };
    };
    static relationMappings: () => {
        actor: {
            relation: import("objection").RelationType;
            modelClass: any;
            join: {
                from: string;
                to: string;
            };
        };
    };
}
