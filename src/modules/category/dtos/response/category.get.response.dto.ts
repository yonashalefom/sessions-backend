import { faker } from '@faker-js/faker';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { DatabaseDto } from 'src/common/database/dtos/database.dto';
import { AwsS3Dto } from 'src/modules/aws/dtos/aws.s3.dto';

export class CategoryGetResponseDto extends DatabaseDto {
    @ApiProperty({
        required: true,
        type: String,
        description: 'Category name',
        example: faker.location.country(),
        maxLength: 100,
        minLength: 1,
    })
    name: string;

    @ApiProperty({
        required: true,
        type: String,
        description: 'Category code, Alpha 2 code version',
        example: faker.location.countryCode('alpha-2'),
        maxLength: 2,
        minLength: 2,
    })
    alpha2Code: string;

    @ApiProperty({
        required: true,
        type: String,
        description: 'Category code, Alpha 3 code version',
        example: faker.location.countryCode('alpha-3'),
        maxLength: 3,
        minLength: 3,
    })
    alpha3Code: string;

    @ApiProperty({
        required: true,
        type: String,
        description: 'Category code, Numeric code version',
        example: faker.location.countryCode('numeric'),
        maxLength: 3,
        minLength: 3,
    })
    numericCode: string;

    @ApiProperty({
        required: true,
        type: String,
        description: 'Category code, FIPS version',
        example: faker.location.countryCode('alpha-2'),
        maxLength: 2,
        minLength: 2,
    })
    fipsCode: string;

    @ApiProperty({
        required: true,
        type: String,
        description: 'Category phone code',
        example: [faker.helpers.arrayElement(['62', '65'])],
        maxLength: 4,
        minLength: 4,
        isArray: true,
        default: [],
    })
    phoneCode: string[];

    @ApiProperty({
        required: true,
        example: faker.location.country(),
    })
    continent: string;

    @ApiProperty({
        required: true,
        example: faker.location.timeZone(),
    })
    timeZone: string;

    @ApiProperty({
        required: false,
        description: 'Top level domain',
        example: faker.internet.domainSuffix(),
    })
    domain?: string;

    @ApiProperty({
        required: false,
        type: AwsS3Dto,
    })
    @Type(() => AwsS3Dto)
    image?: AwsS3Dto;

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
}
