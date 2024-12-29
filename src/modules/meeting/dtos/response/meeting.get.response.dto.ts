import { OmitType } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { DatabaseDto } from 'src/common/database/dtos/database.dto';
import { CallType } from 'src/modules/meeting/repository/entities/meeting.entity';
import { UserShortResponseDto } from 'src/modules/user/dtos/response/user.short.response.dto';

export class MeetingGetResponseDto extends DatabaseDto {
    @Type(() => UserShortResponseDto)
    createdBy: UserShortResponseDto;
    meetingId: string;
    type: CallType;
    isActive: boolean;
}

export class MeetingShortResponseDto extends OmitType(MeetingGetResponseDto, [
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

export class MeetingListResponseDto extends MeetingGetResponseDto {}
