type BookingType = 'inapp_meeting' | 'external_meeting';

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
