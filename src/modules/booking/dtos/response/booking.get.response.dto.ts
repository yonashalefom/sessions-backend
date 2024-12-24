import { OmitType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { DatabaseDto } from 'src/common/database/dtos/database.dto';
import { UserProfileResponseDto } from 'src/modules/user/dtos/response/user.profile.response.dto';

export class BookingGetResponseDto extends DatabaseDto {
    owner: UserProfileResponseDto;
    title: string;
    description: string;
    slug: string;
    eventStartDate?: Date;
    eventEndDate?: Date;
    bookingOffsetMinutes: number;
    currency: string;
    price: number;
    duration: number;
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
