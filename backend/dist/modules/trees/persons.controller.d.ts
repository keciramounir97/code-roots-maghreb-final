import { TreesService } from './trees.service';
import { Person } from '../../models/Person';
export declare class PersonsController {
    private readonly treesService;
    private readonly knex;
    constructor(treesService: TreesService, knex: any);
    private ensureTreeAccess;
    listPublicPeople(treeId: string): Promise<Person[]>;
    getPublicPerson(id: string): Promise<{
        id: number;
        name: string;
        tree: {
            id: number;
            title: string;
        };
    }>;
    listMyPeople(treeId: string, req: any): Promise<Person[]>;
    getMyPerson(id: string, req: any): Promise<{
        id: number;
        name: string;
        tree: {
            id: number;
            title: string;
        };
    }>;
    createMyPerson(treeId: string, body: any, req: any): Promise<{
        id: number;
    }>;
    updateMyPerson(treeId: string, id: string, body: any, req: any): Promise<{
        id: number;
    }>;
    deleteMyPerson(treeId: string, id: string, req: any): Promise<{
        message: string;
    }>;
}
