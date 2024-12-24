import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { DatabaseRepositoryAbstract } from 'src/common/database/abstracts/database.repository.abstract';
import { DatabaseModel } from 'src/common/database/decorators/database.decorator';
import {
    BookingDoc,
    BookingEntity,
} from 'src/modules/booking/repository/entities/booking.entity';

@Injectable()
export class BookingRepository extends DatabaseRepositoryAbstract<
    BookingEntity,
    BookingDoc
> {
    constructor(
        @DatabaseModel(BookingEntity.name)
        private readonly bookingModel: Model<BookingEntity>
    ) {
        super(bookingModel);
    }
}
