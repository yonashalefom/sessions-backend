import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CategoryCreateRequestDto {
    @ApiProperty({
        required: true,
        type: String,
        description: 'Category',
        example: 'Category Name',
        maxLength: 100,
        minLength: 1,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    @MinLength(1)
    category: string;

    @ApiProperty({
        required: false,
        type: String,
        description: 'Category Description',
        example: 'Some Category Description Example.',
        maxLength: 500,
        minLength: 15,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(500)
    @MinLength(15)
    description: string;
}
