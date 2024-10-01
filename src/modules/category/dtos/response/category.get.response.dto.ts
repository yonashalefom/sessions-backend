import { faker } from '@faker-js/faker';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { DatabaseDto } from 'src/common/database/dtos/database.dto';

export class CategoryGetResponseDto extends DatabaseDto {
    @ApiProperty({
        required: true,
        type: String,
        description: 'Category Name',
        maxLength: 100,
        minLength: 1,
    })
    category: string;

    @ApiProperty({
        required: true,
        type: String,
        description: 'Category Description',
        maxLength: 100,
        minLength: 1,
    })
    description: string;

    @ApiProperty({
        required: true,
        type: String,
        description: 'Category Image',
        maxLength: 100,
        minLength: 1,
    })
    categoryImage: string;

    @ApiProperty({
        required: true,
        type: String,
        description: 'Category Slug',
        maxLength: 100,
        minLength: 1,
    })
    slug: string;

    @ApiProperty({
        description: 'Date created at',
        example: faker.date.recent(),
        required: true,
        nullable: false,
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Date updated at',
        example: faker.date.recent(),
        required: true,
        nullable: false,
    })
    updatedAt: Date;

    @ApiHideProperty()
    @Exclude()
    deletedAt?: Date;

    @ApiHideProperty()
    @ApiProperty({
        description: 'Flag for deleted',
        default: false,
        required: true,
        nullable: false,
    })
    deleted: boolean;

    @ApiHideProperty()
    @ApiProperty({
        description: '__V',
        required: false,
    })
    @Exclude()
    __v: string;

    @ApiHideProperty()
    @ApiProperty({
        description: 'indicates if the category is active or not',
        required: false,
    })
    isActive: boolean;
}
