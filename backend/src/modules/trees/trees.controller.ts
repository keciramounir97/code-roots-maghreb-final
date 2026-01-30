
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile, Res, NotFoundException, ForbiddenException, ParseIntPipe, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { TreesService } from './trees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { CreateTreeDto, UpdateTreeDto } from './dto/tree.dto';

@Controller('api')
export class TreesController {
    constructor(private readonly treesService: TreesService) { }

    @Get('trees')
    async listPublic() {
        return this.treesService.listPublic();
    }

    @Get('trees/:id')
    async getPublic(@Param('id', ParseIntPipe) id: number) {
        return this.treesService.getPublic(id);
    }

    @Get('my/trees')
    @UseGuards(JwtAuthGuard)
    async listMy(@Request() req) {
        return this.treesService.listByUser(req.user.id);
    }

    @Get('my/trees/:id')
    @UseGuards(JwtAuthGuard)
    async getMy(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const tree = await this.treesService.findOne(id);
        if (tree.user_id !== req.user.id) throw new ForbiddenException();
        return tree;
    }

    @Post('my/trees')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file')) // Configured in Module for disk storage
    async createMy(
        @Body() body: CreateTreeDto,
        @Request() req,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
                    // GEDCOM is text/plain or binary, hard to validate type strictly, but we can try
                    // new FileTypeValidator({ fileType: 'text/plain' }), 
                ],
                fileIsRequired: false // Might create tree without initial file?
            }),
        ) file?: Express.Multer.File
    ) {
        return this.treesService.create(body, req.user.id, file);
    }

    @Put('my/trees/:id')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async updateMy(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateTreeDto,
        @Request() req,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return this.treesService.update(id, body, req.user.id, req.user.role_id, file);
    }

    @Delete('my/trees/:id')
    @UseGuards(JwtAuthGuard)
    async deleteMy(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.treesService.delete(id, req.user.id, req.user.role_id);
    }

    @Get('my/trees/:id/gedcom')
    @UseGuards(JwtAuthGuard)
    async downloadMyGedcom(@Param('id', ParseIntPipe) id: number, @Res() res: Response, @Request() req) {
        const tree = await this.treesService.findOne(id);
        if (tree.user_id !== req.user.id) throw new ForbiddenException();

        const filePath = this.treesService.getGedcomPath(tree);
        if (!filePath || !fs.existsSync(filePath)) throw new NotFoundException('File not found');

        res.download(filePath, path.basename(filePath));
    }

    // Admin Routes
    @Get('admin/trees')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async listAdmin() {
        return this.treesService.listAdmin();
    }

    @Put('admin/trees/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    @UseInterceptors(FileInterceptor('file'))
    async updateAdmin(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateTreeDto,
        @Request() req,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return this.treesService.update(id, body, req.user.id, req.user.role_id, file);
    }

    @Delete('admin/trees/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async deleteAdmin(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.treesService.delete(id, req.user.id, req.user.role_id);
    }
}
