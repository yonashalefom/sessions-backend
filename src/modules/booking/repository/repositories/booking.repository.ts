import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectDatabaseModel } from 'src/common/database/decorators/database.decorator';
import {
    BookingDoc,
    BookingEntity,
} from 'src/modules/booking/repository/entities/booking.entity';
import { EventEntity } from 'src/modules/events/repository/entities/event.entity';
import { UserEntity } from 'src/modules/user/repository/entities/user.entity';
import { DatabaseRepositoryBase } from 'src/common/database/bases/database.repository';

@Injectable()
export class BookingRepository extends DatabaseRepositoryBase<
    BookingEntity,
    BookingDoc
> {
    constructor(
        @InjectDatabaseModel(BookingEntity.name)
        private readonly bookingModel: Model<BookingEntity>
    ) {
        super(bookingModel, [
            {
                path: 'expertId',
                localField: 'expertId',
                foreignField: '_id',
                model: UserEntity.name,
                justOne: true,
            },
            {
                path: 'userId',
                localField: 'userId',
                foreignField: '_id',
                model: UserEntity.name,
                justOne: true,
            },
            {
                path: 'eventId',
                localField: 'eventId',
                foreignField: '_id',
                model: EventEntity.name,
                justOne: true,
            },
        ]);
    }
}
