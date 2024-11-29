import { faker } from '@faker-js/faker';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class DatabaseDto {
    @ApiProperty({
        description: 'Alias id of api key',
        example: faker.string.uuid(),
        required: true,
    })
    _id: string;

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

    @ApiProperty({
        description: 'Flag for deleted',
        default: false,
        required: true,
        nullable: false,
    })
    @Exclude()
    deleted: boolean;

    @ApiProperty({
        description: 'Date delete at',
        required: false,
        nullable: true,
    })
    @Exclude()
    deletedAt?: Date;

    @ApiProperty({
        description: 'Delete by',
        required: false,
        nullable: true,
    })
    @Exclude()
    deletedBy?: string;

    @ApiHideProperty()
    @Exclude()
    __v: string;
}
