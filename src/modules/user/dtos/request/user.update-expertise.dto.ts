import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateExpertiseRequestDto {
    @ApiProperty({
        description: 'Expert area of expertise',
        example: [faker.string.uuid()],
        required: true,
    })
    expertise: string[];
}

export class UpdateUserInterestsRequestDto {
    @ApiProperty({
        description: "Update User's Interests",
        example: [faker.string.uuid()],
        required: true,
    })
    interests: string[];
}
