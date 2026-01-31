"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityService = void 0;
const common_1 = require("@nestjs/common");
const ActivityLog_1 = require("../../models/ActivityLog");
let ActivityService = class ActivityService {
    constructor(knex) {
        this.knex = knex;
    }
    async log(userId, type, description) {
        try {
            await this.knex('activity_logs').insert({
                actor_user_id: userId,
                type,
                description,
                created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
            });
        }
        catch (err) {
            console.error('Failed to log activity:', err.message);
        }
    }
    async findAll(limit = 50) {
        return ActivityLog_1.ActivityLog.query(this.knex)
            .withGraphFetched('actor')
            .orderBy('created_at', 'desc')
            .limit(limit);
    }
};
exports.ActivityService = ActivityService;
exports.ActivityService = ActivityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('KnexConnection')),
    __metadata("design:paramtypes", [Object])
], ActivityService);
//# sourceMappingURL=activity.service.js.map