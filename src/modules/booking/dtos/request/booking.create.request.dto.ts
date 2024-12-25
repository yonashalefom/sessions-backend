import { BookingStatus } from 'src/modules/booking/repository/entities/booking.entity';

type BookingType = 'INAPP_MEETING' | 'EXTERNAL_MEETING';

export class BookingCreateRequestDto {
    userId: string;

    expertId: string;

    eventId: string;

    description?: string;

    startTime: Date;

    endTime: Date;

    location?: string;

    bookingRefType?: BookingType;

    meetingUrl?: string;

    meetingId?: string;

    meetingPassword?: string;
}

export class CancelBookingRequestDto {
    status: BookingStatus;
    cancellationReason?: string;
}
