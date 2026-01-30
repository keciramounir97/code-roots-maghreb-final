import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TreesService } from './trees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Person } from '../../models/Person';
import { Inject } from '@nestjs/common';

@Controller('api')
export class PersonsController {
    constructor(
        private readonly treesService: TreesService,
        @Inject('KnexConnection') private readonly knex
    ) { }

    private async ensureTreeAccess(treeId: number, user: any) {
        const tree = await this.treesService.findOne(treeId);
        if (!tree) throw new NotFoundException('Tree not found');

        const canManageAll = user.roleName === 'admin' || user.roleName === 'super_admin'; // Simplified role check
        // Actually use the same logic as legacy: roleId === 1 or admin
        // In JwtStrategy/AuthService we perform some mapping. user.role is roleId.

        // Legacy logic: if (user.roleId === 1) return true;
        const isAdmin = user.role_id === 1 || user.role === 1 || user.roleName === 'admin';

        if (!isAdmin && tree.user_id !== user.id) {
            throw new ForbiddenException('Forbidden');
        }
        return tree;
    }

    // Public Persons
    @Get('trees/:treeId/people')
    async listPublicPeople(@Param('treeId') treeId: string) {
        const tree = await this.treesService.getPublic(+treeId);
        return Person.query(this.knex).where('tree_id', tree.id).orderBy('name', 'asc');
    }

    @Get('people/:id')
    async getPublicPerson(@Param('id') id: string) {
        const person = await Person.query(this.knex).findById(+id).withGraphFetched('tree');
        if (!person || !person.tree) throw new NotFoundException('Not found');
        if (!person.tree.is_public) throw new ForbiddenException('Forbidden');

        return {
            id: person.id,
            name: person.name,
            tree: { id: person.tree.id, title: person.tree.title }
        };
    }

    // My Persons
    @Get('my/trees/:treeId/people')
    @UseGuards(JwtAuthGuard)
    async listMyPeople(@Param('treeId') treeId: string, @Request() req) {
        await this.ensureTreeAccess(+treeId, req.user);
        return Person.query(this.knex).where('tree_id', +treeId).orderBy('name', 'asc');
    }

    @Get('my/people/:id')
    @UseGuards(JwtAuthGuard)
    async getMyPerson(@Param('id') id: string, @Request() req) {
        const person = await Person.query(this.knex).findById(+id).withGraphFetched('tree');
        if (!person || !person.tree) throw new NotFoundException('Not found');

        await this.ensureTreeAccess(person.tree.id, req.user);

        return {
            id: person.id,
            name: person.name,
            tree: { id: person.tree.id, title: person.tree.title }
        };
    }

    @Post('my/trees/:treeId/people')
    @UseGuards(JwtAuthGuard)
    async createMyPerson(@Param('treeId') treeId: string, @Body() body, @Request() req) {
        await this.ensureTreeAccess(+treeId, req.user);

        if (!body.name) throw new ForbiddenException('Name is required'); // Should be BadRequest

        const created = await Person.query(this.knex).insert({
            name: body.name,
            tree_id: +treeId
        });
        return { id: created.id };
    }

    @Put('my/trees/:treeId/people/:id')
    @UseGuards(JwtAuthGuard)
    async updateMyPerson(@Param('treeId') treeId: string, @Param('id') id: string, @Body() body, @Request() req) {
        await this.ensureTreeAccess(+treeId, req.user);

        const person = await Person.query(this.knex).findById(+id);
        if (!person || person.tree_id !== +treeId) throw new NotFoundException('Not found');

        if (!body.name) throw new ForbiddenException('Name is required');

        const updated = await Person.query(this.knex).patchAndFetchById(+id, { name: body.name });
        return { id: updated.id };
    }

    @Delete('my/trees/:treeId/people/:id')
    @UseGuards(JwtAuthGuard)
    async deleteMyPerson(@Param('treeId') treeId: string, @Param('id') id: string, @Request() req) {
        await this.ensureTreeAccess(+treeId, req.user);

        const person = await Person.query(this.knex).findById(+id);
        if (!person || person.tree_id !== +treeId) throw new NotFoundException('Not found');

        await Person.query(this.knex).deleteById(+id);
        return { message: 'Deleted' };
    }
}
