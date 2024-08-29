import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { UserCreateRequestDto } from 'src/modules/user/dtos/request/user.create.request.dto';

export class UserUpdateProfileRequestDto extends PickType(
    UserCreateRequestDto,
    ['name', 'country'] as const
) {
    @ApiProperty({
        required: false,
        minLength: 10,
        maxLength: 200,
    })
    @IsString()
    @IsOptional()
    readonly address?: string;
}
