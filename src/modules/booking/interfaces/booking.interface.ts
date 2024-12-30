import { BookingEntity } from 'src/modules/booking/repository/entities/booking.entity';
import { BookingReferenceEntity } from 'src/modules/booking/repository/entities/booking.reference.entity';
import { EventEntity } from 'src/modules/events/repository/entities/event.entity';
import { UserEntity } from 'src/modules/user/repository/entities/user.entity';

export interface IBookingEntity
    extends Omit<
        BookingEntity,
        'expertId' | 'userId' | 'eventId' | 'bookingRef'
    > {
    expertId: UserEntity;
    userId: UserEntity;
    eventId: EventEntity;
    bookingRef: BookingReferenceEntity;
}
