import { OmitType } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { DatabaseDto } from 'src/common/database/dtos/database.dto';
import { BookingStatus } from 'src/modules/booking/repository/entities/booking.entity';
import { EventShortResponseDto } from 'src/modules/events/dtos/response/event.get.response.dto';
import { UserShortResponseDto } from 'src/modules/user/dtos/response/user.short.response.dto';

export class BookingRefResponseDto {
    type: string;
    meetingId: string;
    meetingUrl: string;
}

export class BookingGetResponseDto extends DatabaseDto {
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
    status: BookingStatus;
    cancellationReason?: string;
    rejectionReason?: string;
    rating?: number;
    ratingFeedback?: string;
    @Type(() => BookingRefResponseDto)
    bookingRef?: BookingRefResponseDto;
    expired: boolean;
    isActive: boolean;
}

export class BookingShortResponseDto extends OmitType(BookingGetResponseDto, [
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

export class BookingListResponseDto extends BookingGetResponseDto {}
