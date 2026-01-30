import { Injectable, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { User } from '../../models/User';
import { Book } from '../../models/Book';
import { Tree } from '../../models/Tree';
import { Gallery } from '../../models/Gallery';
import { ActivityLog } from '../../models/ActivityLog';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class UsersService {
    constructor(
        @Inject('KnexConnection') private readonly knex,
        private readonly activityService: ActivityService,
    ) { }

    async findAll() {
        return User.query(this.knex)
            .select(
                'users.id',
                'users.full_name as fullName',
                'users.phone_number as phoneNumber',
                'users.email',
                'users.role_id as roleId',
                'users.status',
                'users.created_at as createdAt',
                'users.last_login as lastLogin',
                'roles.name as roleName'
            )
            .joinRelated('role')
            .orderBy('users.created_at', 'desc')
            .limit(100);
    }

    async findOne(id: number) {
        const user = await User.query(this.knex)
            .findById(id)
            .select(
                'users.id',
                'users.full_name as fullName',
                'users.phone_number as phoneNumber',
                'users.email',
                'users.role_id as roleId',
                'users.status',
                'users.created_at as createdAt',
                'users.last_login as lastLogin',
                'roles.name as roleName'
            )
            .joinRelated('role');

        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async findByEmail(email: string) {
        return User.query(this.knex).findOne({ email });
    }

    async create(data: any, adminId: number) {
        const existing = await this.findByEmail(data.email);
        if (existing) throw new BadRequestException('Email already registered');

        const randomPassword = crypto.randomBytes(24).toString('hex');
        const passwordHash = await bcrypt.hash(randomPassword, 10);

        const newUser = await User.query(this.knex).insert({
            full_name: data.fullName || data.full_name,
            phone_number: data.phone || data.phoneNumber || data.phone_number,
            email: data.email,
            password: passwordHash,
            role_id: data.roleId || data.role_id || 2,
            status: 'active',
        });

        await this.activityService.log(adminId, 'users', `Created user: ${data.email}`);

        // In a real scenario, we'd trigger a reset code here.
        return newUser;
    }

    async update(id: number, data: any, adminId: number) {
        const user = await User.query(this.knex).findById(id);
        if (!user) throw new NotFoundException('User not found');

        const updateData: any = {};
        if (data.fullName !== undefined) updateData.full_name = data.fullName;
        if (data.full_name !== undefined) updateData.full_name = data.full_name;

        if (data.phone !== undefined) updateData.phone_number = data.phone;
        if (data.phoneNumber !== undefined) updateData.phone_number = data.phoneNumber;
        if (data.phone_number !== undefined) updateData.phone_number = data.phone_number;

        if (data.roleId !== undefined) updateData.role_id = data.roleId;
        if (data.role_id !== undefined) updateData.role_id = data.role_id;

        if (data.status !== undefined) updateData.status = data.status;

        await User.query(this.knex).patch(updateData).where('id', id);
        await this.activityService.log(adminId, 'users', `Updated user #${id}`);

        return { message: 'User updated' };
    }

    async delete(id: number, adminId: number) {
        if (Number(id) === Number(adminId)) {
            throw new BadRequestException('You cannot delete your own account');
        }

        const user = await User.query(this.knex).findById(id);
        if (!user) throw new NotFoundException('User not found');

        // Transactional deletion
        await User.transaction(this.knex, async (trx) => {
            await Book.query(trx).patch({ uploaded_by: null }).where('uploaded_by', id);
            await Tree.query(trx).patch({ user_id: null }).where('user_id', id);
            await Gallery.query(trx).patch({ uploaded_by: null }).where('uploaded_by', id);
            await ActivityLog.query(trx).patch({ actor_user_id: null }).where('actor_user_id', id);

            // Delete password resets if table exists model
            await trx('password_resets').delete().where('email', user.email);

            await User.query(trx).deleteById(id);
        });

        await this.activityService.log(adminId, 'users', `Deleted user #${id}`);
        return { message: 'User deleted' };
    }
}
