import { OmitType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { DatabaseDto } from 'src/common/database/dtos/database.dto';
import { UserProfileResponseDto } from 'src/modules/user/dtos/response/user.profile.response.dto';

export class ScheduleGetResponseDto extends DatabaseDto {
    userId: UserProfileResponseDto;
    title: string;
    isActive: boolean;
}

export class ScheduleShortResponseDto extends OmitType(ScheduleGetResponseDto, [
    'createdAt',
    'updatedAt',
    'deletedAt',
    'deleted',
    '__v',
    'isActive',
] as const) {
    @Exclude()
    createdAt: Date;

    @Exclude()
    updatedAt: Date;

    @Exclude()
    deleted: boolean;

    @Exclude()
    isActive: boolean;

    @Exclude()
    __v: boolean;
}

export class ScheduleListResponseDto extends ScheduleGetResponseDto {}
