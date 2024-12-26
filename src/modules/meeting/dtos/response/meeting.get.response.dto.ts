import { OmitType } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { DatabaseDto } from 'src/common/database/dtos/database.dto';
import { EventShortResponseDto } from 'src/modules/events/dtos/response/event.get.response.dto';
import { MeetingStatus } from 'src/modules/meeting/repository/entities/meeting.entity';
import { UserShortResponseDto } from 'src/modules/user/dtos/response/user.short.response.dto';

export class MeetingRefResponseDto {
    type: string;
    meetingId: string;
    meetingUrl: string;
}

export class MeetingGetResponseDto extends DatabaseDto {
    // expertId: UserProfileResponseDto;
    @Type(() => UserShortResponseDto)
    expertId: UserShortResponseDto;
    @Type(() => UserShortResponseDto)
    userId: UserShortResponseDto;
    @Type(() => EventShortResponseDto)
    eventId: EventShortResponseDto;
    description: string;
    startTime: Date;
    endTime: Date;
    status: MeetingStatus;
    cancellationReason?: string;
    rejectionReason?: string;
    rating?: number;
    ratingFeedback?: string;
    @Type(() => MeetingRefResponseDto)
    bookingRef?: MeetingRefResponseDto;
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
