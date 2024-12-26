import { MeetingStatus } from 'src/modules/meeting/repository/entities/meeting.entity';

type MeetingType = 'INAPP_MEETING' | 'EXTERNAL_MEETING';

export class MeetingCreateRequestDto {
    userId: string;

    expertId: string;

    eventId: string;

    description?: string;

    startTime: Date;

    endTime: Date;

    location?: string;

    bookingRefType?: MeetingType;

    meetingUrl?: string;

    meetingId?: string;

    meetingPassword?: string;
}

export class CancelMeetingRequestDto {
    status: MeetingStatus;
    cancellationReason?: string;
}
