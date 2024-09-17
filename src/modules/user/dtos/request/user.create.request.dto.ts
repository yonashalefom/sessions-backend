import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';

export class UserCreateRequestDto {
    @ApiProperty({
        example: faker.internet.email(),
        required: true,
        maxLength: 100,
    })
    email: string;

    @ApiProperty({
        example: faker.string.uuid(),
        required: true,
    })
    role: string;

    @ApiProperty({
        example: faker.person.fullName(),
        required: true,
        maxLength: 100,
        minLength: 1,
    })
    name: string;

    @ApiProperty({
        example: faker.string.uuid(),
        required: true,
    })
    country: string;
}
