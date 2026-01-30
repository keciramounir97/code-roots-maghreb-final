import { TreesService } from './trees.service';
import { Response } from 'express';
import { CreateTreeDto, UpdateTreeDto } from './dto/tree.dto';
export declare class TreesController {
    private readonly treesService;
    constructor(treesService: TreesService);
    listPublic(): Promise<import("../../models/Tree").Tree[]>;
    getPublic(id: number): Promise<import("../../models/Tree").Tree>;
    listMy(req: any): Promise<import("../../models/Tree").Tree[]>;
    getMy(id: number, req: any): Promise<import("../../models/Tree").Tree>;
    createMy(body: CreateTreeDto, req: any, file?: Express.Multer.File): Promise<import("../../models/Tree").Tree>;
    updateMy(id: number, body: UpdateTreeDto, req: any, file?: Express.Multer.File): Promise<{
        id: number;
    }>;
    deleteMy(id: number, req: any): Promise<{
        message: string;
    }>;
    downloadMyGedcom(id: number, res: Response, req: any): Promise<void>;
    listAdmin(): Promise<import("../../models/Tree").Tree[]>;
    updateAdmin(id: number, body: UpdateTreeDto, req: any, file?: Express.Multer.File): Promise<{
        id: number;
    }>;
    deleteAdmin(id: number, req: any): Promise<{
        message: string;
    }>;
}
