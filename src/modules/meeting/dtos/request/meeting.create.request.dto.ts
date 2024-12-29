import { CallType } from 'src/modules/meeting/repository/entities/meeting.entity';

export class MeetingCreateRequestDto {
    meetingId: string;

    type: CallType;

    createdBy: string;
}
