import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    MaxLength,
    MinLength,
    IsUUID,
    IsEnum,
} from 'class-validator';
import { IsCustomEmail } from 'src/common/request/validations/request.custom-email.validation';
import { ENUM_USER_GENDER } from 'src/modules/user/enums/user.enum';

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

    @ApiProperty({
        required: true,
        enum: ENUM_USER_GENDER,
        example: ENUM_USER_GENDER.MALE,
    })
    gender: ENUM_USER_GENDER;
}
