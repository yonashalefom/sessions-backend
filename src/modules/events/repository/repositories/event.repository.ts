import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { DatabaseRepositoryAbstract } from 'src/common/database/abstracts/database.repository.abstract';
import { DatabaseModel } from 'src/common/database/decorators/database.decorator';
import {
    EventDoc,
    EventEntity,
} from 'src/modules/events/repository/entities/event.entity';
import { UserEntity } from 'src/modules/user/repository/entities/user.entity';

@Injectable()
export class EventRepository extends DatabaseRepositoryAbstract<
    EventEntity,
    EventDoc
> {
    constructor(
        @DatabaseModel(EventEntity.name)
        private readonly eventModel: Model<EventEntity>
    ) {
        super(eventModel, [
            {
                path: 'owner',
                localField: 'owner',
                foreignField: '_id',
                model: UserEntity.name,
                justOne: true,
            },
        ]);
    }
}
