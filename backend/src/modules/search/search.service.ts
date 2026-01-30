import { Injectable, Inject } from '@nestjs/common';
import { Book } from '../../models/Book';
import { Tree } from '../../models/Tree';
import { Person } from '../../models/Person';
import { User } from '../../models/User';

@Injectable()
export class SearchService {
    constructor(@Inject('KnexConnection') private readonly knex) { }

    async search(query: string, user?: User) {
        if (!query) return { books: [], trees: [], people: [] };
        const q = query.trim();

        // Check visibility
        const canSeeAllTrees = user && (user.roleName === 'admin' || user.roleName === 'super_admin' || user.role_id === 1); // logic simplified

        // Books
        const books = await Book.query(this.knex)
            .where('is_public', true)
            .andWhere((builder) => {
                builder.where('title', 'like', `${q}%`)
                    .orWhere('author', 'like', `${q}%`)
                    .orWhere('category', 'like', `${q}%`)
                    .orWhere('description', 'like', `%${q}%`);
            })
            .orderBy('title', 'asc')
            .limit(20);

        // Trees
        const treeQuery = Tree.query(this.knex)
            .where((builder) => {
                builder.where('title', 'like', `${q}%`)
                    .orWhere('title', 'like', `%${q}%`)
                    .orWhere('description', 'like', `${q}%`)
                    .orWhere('description', 'like', `%${q}%`);
            });

        if (!canSeeAllTrees) {
            if (user) {
                treeQuery.andWhere((builder) => {
                    builder.where('is_public', true).orWhere('user_id', user.id);
                });
            } else {
                treeQuery.where('is_public', true);
            }
        }

        const trees = await treeQuery.orderBy('title', 'asc').limit(20).withGraphFetched('owner');

        // People
        const peopleQuery = Person.query(this.knex)
            .joinRelated('tree')
            .where('name', 'like', `%${q}%`);

        if (!canSeeAllTrees) {
            if (user) {
                peopleQuery.where((builder) => {
                    builder.where('tree.is_public', true).orWhere('tree.user_id', user.id);
                });
            } else {
                peopleQuery.where('tree.is_public', true);
            }
        }

        const people = await peopleQuery
            .orderBy('name', 'asc')
            .limit(30)
            .withGraphFetched('tree.owner');

        return {
            books,
            trees: trees.map((t: any) => ({
                ...t,
                owner_name: t.owner?.full_name
            })),
            people: people.map((p: any) => ({
                id: p.id,
                name: p.name,
                tree_id: p.tree?.id,
                tree_title: p.tree?.title,
                tree_description: p.tree?.description,
                tree_is_public: !!p.tree?.is_public,
                owner_name: p.tree?.owner?.full_name
            }))
        };
    }
}
