import { Knex } from 'knex';
export declare class HealthController {
    private readonly knex;
    constructor(knex: Knex);
    health(): Promise<{
        status: string;
        timestamp: string;
        database: string;
        uptime: number;
        memory: NodeJS.MemoryUsage;
        version: string;
        error?: undefined;
    } | {
        status: string;
        timestamp: string;
        database: string;
        error: any;
        uptime: number;
        memory: NodeJS.MemoryUsage;
        version?: undefined;
    }>;
}
