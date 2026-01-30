
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGalleryDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    // Optional associations
    @IsOptional()
    bookId?: string | number;

    @IsOptional()
    treeId?: string | number;
}

export class UpdateGalleryDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;
}
