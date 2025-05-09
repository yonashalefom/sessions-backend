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
    })
    createdAt: Date;

    @ApiProperty({
        description: 'created by',
        required: false,
    })
    @Exclude()
    createdBy?: string;

    @ApiProperty({
        description: 'Date updated at',
        example: faker.date.recent(),
        required: true,
    })
    updatedAt: Date;

    @ApiProperty({
        description: 'updated by',
        required: false,
    })
    @Exclude()
    updatedBy?: string;

    @ApiProperty({
        description: 'Flag for deleted',
        default: false,
        required: true,
    })
    @Exclude()
    deleted: boolean;

    @ApiProperty({
        description: 'Date delete at',
        required: false,
    })
    @Exclude()
    deletedAt?: Date;

    @ApiProperty({
        description: 'Delete by',
        required: false,
    })
    @Exclude()
    deletedBy?: string;

    @ApiHideProperty()
    @Exclude()
    __v?: number;
}
