import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Model } from 'objection';
import * as Knex from 'knex';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'KnexConnection',
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const knexConfig = {
                    client: 'mysql2',
                    connection: {
                        host: configService.get<string>('DB_HOST'),
                        port: configService.get<number>('DB_PORT') || 3306,
                        user: configService.get<string>('DB_USER'),
                        password: configService.get<string>('DB_PASSWORD'),
                        database: configService.get<string>('DB_NAME'),
                        charset: 'utf8mb4',
                    },
                    pool: {
                        min: 0,
                        max: 5,
                        acquireTimeoutMillis: 30000,
                        createTimeoutMillis: 30000,
                        destroyTimeoutMillis: 5000,
                        idleTimeoutMillis: 30000,
                    },
                    debug: configService.get<string>('NODE_ENV') === 'development',
                };

                const knex = Knex.default(knexConfig);
                Model.knex(knex);
                return knex;
            },
        },
    ],
    exports: ['KnexConnection'],
})
export class DatabaseModule { }
