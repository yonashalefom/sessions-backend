import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { ENUM_BOOKING_STATUS_CODE_ERROR } from 'src/modules/booking/enums/booking.status-code.enum';
import { MeetingDoc } from 'src/modules/meeting/repository/entities/meeting.entity';
import { MeetingService } from 'src/modules/meeting/services/meeting.service';

@Injectable()
export class MeetingParsePipe implements PipeTransform {
    constructor(private readonly meetingService: MeetingService) {}

    async transform(value: any): Promise<MeetingDoc> {
        const booking: MeetingDoc = await this.meetingService.findOneById(
            value,
            { join: true }
        );

        if (!booking) {
            throw new NotFoundException({
                statusCode: ENUM_BOOKING_STATUS_CODE_ERROR.NOT_FOUND,
                message: 'booking.error.notFound',
            });
        }

        return booking;
    }
}
