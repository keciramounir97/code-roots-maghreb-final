"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const objection_1 = require("objection");
const Knex = require("knex");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [
            {
                provide: 'KnexConnection',
                inject: [config_1.ConfigService],
                useFactory: async (configService) => {
                    const knexConfig = {
                        client: 'mysql2',
                        connection: {
                            host: configService.get('DB_HOST'),
                            port: configService.get('DB_PORT') || 3306,
                            user: configService.get('DB_USER'),
                            password: configService.get('DB_PASSWORD'),
                            database: configService.get('DB_NAME'),
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
                        debug: configService.get('NODE_ENV') === 'development',
                    };
                    const knex = Knex.default(knexConfig);
                    objection_1.Model.knex(knex);
                    return knex;
                },
            },
        ],
        exports: ['KnexConnection'],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map