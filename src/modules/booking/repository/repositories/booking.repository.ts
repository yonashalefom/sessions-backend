import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { DatabaseRepositoryAbstract } from 'src/common/database/abstracts/database.repository.abstract';
import { DatabaseModel } from 'src/common/database/decorators/database.decorator';
import {
    EventDoc,
    EventEntity,
} from 'src/modules/events/repository/entities/event.entity';

@Injectable()
export class BookingRepository extends DatabaseRepositoryAbstract<
    EventEntity,
    EventDoc
> {
    constructor(
        @DatabaseModel(EventEntity.name)
        private readonly eventModel: Model<EventEntity>
    ) {
        super(eventModel);
    }
}
