
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, UseInterceptors, UploadedFiles, Res, NotFoundException, ForbiddenException, ParseIntPipe } from '@nestjs/common';
import { BooksService } from './books.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';

@Controller('api')
export class BooksController {
    constructor(private readonly booksService: BooksService) { }

    // Public Routes
    @Get('books')
    async listPublic() {
        return this.booksService.listPublic();
    }

    @Get('books/:id')
    async getPublic(@Param('id', ParseIntPipe) id: number) {
        return this.booksService.getPublic(id);
    }

    @Get('books/:id/download')
    async downloadPublic(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
        const book = await this.booksService.getPublic(id);
        if (!book.is_public) throw new ForbiddenException('Not public');

        const filePath = this.booksService.getFilePath(book);
        if (!filePath || !fs.existsSync(filePath)) throw new NotFoundException('File not found');

        await this.booksService.incrementDownload(id);
        res.download(filePath, path.basename(filePath));
    }

    // My Routes
    @Get('my/books')
    @UseGuards(JwtAuthGuard)
    async listMy(@Request() req) {
        return this.booksService.listByUser(req.user.id);
    }

    @Get('my/books/:id')
    @UseGuards(JwtAuthGuard)
    async getMy(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const book = await this.booksService.findOne(id);
        if (book.uploaded_by !== req.user.id) throw new ForbiddenException();
        return book;
    }

    @Post('my/books')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'file', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
    ]))
    async createMy(@Body() body: CreateBookDto, @Request() req, @UploadedFiles() files: { file?: Express.Multer.File[], cover?: Express.Multer.File[] }) {
        return this.booksService.create(body, req.user.id, files);
    }

    @Put('my/books/:id')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'file', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
    ]))
    async updateMy(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateBookDto, @Request() req, @UploadedFiles() files: { file?: Express.Multer.File[], cover?: Express.Multer.File[] }) {
        return this.booksService.update(id, body, req.user.id, req.user.role_id, files);
    }

    @Delete('my/books/:id')
    @UseGuards(JwtAuthGuard)
    async deleteMy(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.booksService.delete(id, req.user.id, req.user.role_id);
    }

    @Get('my/books/:id/download')
    @UseGuards(JwtAuthGuard)
    async downloadMy(@Param('id', ParseIntPipe) id: number, @Res() res: Response, @Request() req) {
        const book = await this.booksService.findOne(id);
        if (book.uploaded_by !== req.user.id) throw new ForbiddenException();

        const filePath = this.booksService.getFilePath(book);
        if (!filePath || !fs.existsSync(filePath)) throw new NotFoundException('File not found');

        await this.booksService.incrementDownload(id);
        res.download(filePath, path.basename(filePath));
    }

    // Admin Routes
    @Get('admin/books')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async listAdmin() {
        return this.booksService.listAdmin();
    }

    @Post('admin/books')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'file', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
    ]))
    async createAdmin(@Body() body: CreateBookDto, @Request() req, @UploadedFiles() files: { file?: Express.Multer.File[], cover?: Express.Multer.File[] }) {
        return this.booksService.create(body, req.user.id, files);
    }

    @Put('admin/books/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'file', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
    ]))
    async updateAdmin(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateBookDto, @Request() req, @UploadedFiles() files: { file?: Express.Multer.File[], cover?: Express.Multer.File[] }) {
        return this.booksService.update(id, body, req.user.id, req.user.role_id, files);
    }

    @Delete('admin/books/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async deleteAdmin(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.booksService.delete(id, req.user.id, req.user.role_id);
    }
}
