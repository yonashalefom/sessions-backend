import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UserListResponseDto } from 'src/modules/user/dtos/response/user.list.response.dto';

export class ExpertsListByCategoryResponseDto {
    @ApiProperty({
        required: true,
        nullable: false,
        maxLength: 100,
        minLength: 1,
    })
    expertiseCategory: string;

    @ApiProperty({
        required: true,
        nullable: false,
        maxLength: 50,
        minLength: 3,
    })
    expertiseDescription: string;

    @ApiProperty({
        required: true,
        nullable: false,
        example: faker.internet.email(),
        maxLength: 100,
    })
    @Type(() => UserListResponseDto)
    users: [UserListResponseDto];
}
