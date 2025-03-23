import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectDatabaseModel } from 'src/common/database/decorators/database.decorator';
import {
    EventDoc,
    EventEntity,
} from 'src/modules/events/repository/entities/event.entity';
import { UserEntity } from 'src/modules/user/repository/entities/user.entity';
import { DatabaseRepositoryBase } from 'src/common/database/bases/database.repository';

@Injectable()
export class EventRepository extends DatabaseRepositoryBase<
    EventEntity,
    EventDoc
> {
    constructor(
        @InjectDatabaseModel(EventEntity.name)
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
