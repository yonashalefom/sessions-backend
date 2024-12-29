import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { ENUM_BOOKING_STATUS_CODE_ERROR } from 'src/modules/booking/enums/booking.status-code.enum';
import { BookingDoc } from 'src/modules/booking/repository/entities/booking.entity';
import { BookingService } from 'src/modules/booking/services/booking.service';

@Injectable()
export class BookingParsePipe implements PipeTransform {
    constructor(private readonly bookingService: BookingService) {}

    async transform(value: any): Promise<BookingDoc> {
        const booking: BookingDoc = await this.bookingService.findOneById(
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
