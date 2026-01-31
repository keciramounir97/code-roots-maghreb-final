import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Tree } from '../../models/Tree';
import { Person } from '../../models/Person';
import { ActivityService } from '../activity/activity.service';
import { resolveStoredFilePath, safeUnlink, safeMoveFile, PRIVATE_TREE_UPLOADS_DIR, TREE_UPLOADS_DIR } from '../../common/utils/file.utils';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class TreesService {
    constructor(
        @Inject('KnexConnection') private readonly knex,
        private readonly activityService: ActivityService,
    ) { }

    async listPublic() {
        return Tree.query(this.knex)
            .where('is_public', true)
            .orderBy('created_at', 'desc')
            .withGraphFetched('owner')
            .modifyGraph('owner', (builder) => builder.select('id', 'full_name'));
    }

    async getPublic(id: number) {
        const tree = await Tree.query(this.knex)
            .findById(id)
            .where('is_public', true)
            .withGraphFetched('owner')
            .modifyGraph('owner', (builder) => builder.select('id', 'full_name'));

        if (!tree) throw new NotFoundException('Tree not found');
        return tree;
    }

    async listByUser(userId: number) {
        return Tree.query(this.knex)
            .where('user_id', userId)
            .orderBy('created_at', 'desc')
            .withGraphFetched('owner')
            .modifyGraph('owner', (builder: any) => builder.select('id', 'full_name', 'email'))
            .withGraphFetched('people');
    }

    async listAdmin() {
        return Tree.query(this.knex)
            .orderBy('created_at', 'desc')
            .withGraphFetched('owner')
            .modifyGraph('owner', (builder: any) => builder.select('id', 'full_name', 'email'));
    }

    async findOne(id: number) {
        const tree = await Tree.query(this.knex).findById(id).withGraphFetched('owner');
        if (!tree) throw new NotFoundException('Tree not found');
        return tree;
    }

    async create(data: any, userId: number, file?: Express.Multer.File) {
        const title = data.title ?? data.name;
        if (!title) {
            throw new BadRequestException('Title is required');
        }

        const isPublic = data.isPublic === 'true' || data.isPublic === true;
        let gedcomPath = file ? `/uploads/trees/${file.filename}` : null;

        if (file && !isPublic) {
            const src = file.path;
            const dest = path.join(PRIVATE_TREE_UPLOADS_DIR, file.filename);
            safeMoveFile(src, dest);
            gedcomPath = `private/trees/${file.filename}`;
        }

        const newTree = await Tree.query(this.knex).insertAndFetch({
            title,
            description: data.description,
            archive_source: data.archiveSource,
            document_code: data.documentCode,
            gedcom_path: gedcomPath,
            user_id: userId,
            is_public: isPublic,
        });

        if (gedcomPath) {
            await this.rebuildPeople(newTree.id, gedcomPath);
        }

        await this.activityService.log(userId, 'trees', `Created tree: ${title}`);
        return newTree;
    }

    async update(id: number, data: any, userId: number, userRole: number, file?: Express.Multer.File) {
        const tree = await this.findOne(id);

        const roleId = Number(userRole ?? 0);
        const isAdmin = roleId === 1 || roleId === 3;
        const isOwner = tree.user_id === userId;
        if (!isAdmin && !isOwner) {
            throw new ForbiddenException('Forbidden');
        }

        const updateData: any = {};
        const title = data.title ?? data.name;
        if (title) updateData.title = title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.archiveSource !== undefined) updateData.archive_source = data.archiveSource;
        if (data.documentCode !== undefined) updateData.document_code = data.documentCode;

        const isPublic = data.isPublic !== undefined
            ? (data.isPublic === 'true' || data.isPublic === true || data.isPublic === 1)
            : !!tree.is_public;
        updateData.is_public = Boolean(isPublic);

        let gedcomPath = tree.gedcom_path;

        if (file) {
            // Delete old
            if (tree.gedcom_path) safeUnlink(resolveStoredFilePath(tree.gedcom_path));

            // Save new
            let newPath = `/uploads/trees/${file.filename}`;
            if (!isPublic) {
                const dest = path.join(PRIVATE_TREE_UPLOADS_DIR, file.filename);
                safeMoveFile(file.path, dest);
                newPath = `private/trees/${file.filename}`;
            }
            updateData.gedcom_path = newPath;
            gedcomPath = newPath;
        } else if (tree.is_public !== isPublic && tree.gedcom_path) {
            // Move existing file
            const currentPath = resolveStoredFilePath(tree.gedcom_path);
            if (currentPath && fs.existsSync(currentPath)) {
                const filename = path.basename(currentPath);
                if (isPublic) {
                    const dest = path.join(TREE_UPLOADS_DIR, filename);
                    safeMoveFile(currentPath, dest);
                    updateData.gedcom_path = `/uploads/trees/${filename}`;
                } else {
                    const dest = path.join(PRIVATE_TREE_UPLOADS_DIR, filename);
                    safeMoveFile(currentPath, dest);
                    updateData.gedcom_path = `private/trees/${filename}`;
                }
                gedcomPath = updateData.gedcom_path;
            }
        }

        await Tree.query(this.knex).patch(updateData).where('id', id);

        if (file || (gedcomPath && tree.is_public !== isPublic)) { // rebuild if file changed or re-moved? Actually only if file changed usually.
            // But existing logic rebuilds if gedcomPath is present.
            // Let's rebuild if file changed.
            if (file) {
                await this.rebuildPeople(id, gedcomPath);
            }
        }

        await this.activityService.log(userId, 'trees', `Updated tree: ${tree.title}`);
        return { id };
    }

    async delete(id: number, userId: number, userRole: number) {
        const tree = await this.findOne(id);

        const roleId = Number(userRole ?? 0);
        const isAdmin = roleId === 1 || roleId === 3;
        const isOwner = tree.user_id === userId;
        if (!isAdmin && !isOwner) {
            throw new ForbiddenException('Forbidden');
        }

        if (tree.gedcom_path) safeUnlink(resolveStoredFilePath(tree.gedcom_path));

        // Delete people first (cascade usually handles this in DB, but safe to do manual)
        await Person.query(this.knex).delete().where('tree_id', id);
        await Tree.query(this.knex).deleteById(id);

        await this.activityService.log(userId, 'trees', `Deleted tree: ${tree.title}`);
        return { message: 'Deleted' };
    }

    getGedcomPath(tree: Tree) {
        return resolveStoredFilePath(tree.gedcom_path);
    }

    // GEDCOM Parsing Logic
    private normalizeGedcomName(raw: string) {
        const cleaned = String(raw || '').replace(/\//g, ' ').replace(/\s+/g, ' ').trim();
        return cleaned || null;
    }

    private parseGedcomPeople(text: string) {
        const lines = String(text || '').split(/\r\n|\n|\r/);
        const people = [];
        let current = null;

        const flush = () => {
            if (!current) return;
            let name = current.name || [this.normalizeGedcomName(current.given), this.normalizeGedcomName(current.surname)].filter(Boolean).join(' ').trim() || null;
            if (name) people.push({ name });
            current = null;
        };

        for (const rawLine of lines) {
            const line = String(rawLine || '').trim();
            if (!line) continue;
            const parts = line.split(/\s+/);

            if (parts[0] === '0') {
                if (/^0\s+@[^@]+@\s+INDI\b/i.test(line) || /^0\s+INDI\b/i.test(line)) {
                    flush();
                    current = { name: null, given: '', surname: '' };
                } else {
                    flush();
                    current = null;
                }
                continue;
            }

            if (!current) continue;

            const tag = String(parts[1] || '').toUpperCase();
            const value = parts.slice(2).join(' ').trim();

            if (tag === 'NAME') current.name = this.normalizeGedcomName(value);
            if (tag === 'GIVN') current.given = value;
            if (tag === 'SURN') current.surname = value;
        }
        flush();
        return people;
    }

    async rebuildPeople(treeId: number, gedcomPath: string) {
        if (!treeId) return;
        try {
            const filePath = resolveStoredFilePath(gedcomPath);
            if (!filePath || !fs.existsSync(filePath)) {
                await Person.query(this.knex).delete().where('tree_id', treeId);
                return;
            }

            let people: { name?: string }[] = [];
            try {
                people = this.parseGedcomPeople(fs.readFileSync(filePath, 'utf8')) || [];
            } catch (parseErr) {
                console.warn('GEDCOM parse failed, keeping existing people:', (parseErr as Error)?.message);
                return;
            }

            await Person.query(this.knex).delete().where('tree_id', treeId);
            if (!people.length) return;

            const chunkSize = 500;
            for (let i = 0; i < people.length; i += chunkSize) {
                const chunk = people.slice(i, i + chunkSize).map(p => ({ tree_id: treeId, name: p.name }));
                await Person.query(this.knex).insert(chunk);
            }
        } catch (err) {
            console.error('Failed to rebuild tree people', err.message);
        }
    }
}
