import { Injectable } from '@nestjs/common';
import { Model, PopulateOptions } from 'mongoose';
import { InjectDatabaseModel } from 'src/common/database/decorators/database.decorator';
import { EventEntity } from 'src/modules/events/repository/entities/event.entity';
import {
    MeetingDoc,
    MeetingEntity,
} from 'src/modules/meeting/repository/entities/meeting.entity';
import { UserEntity } from 'src/modules/user/repository/entities/user.entity';
import { DatabaseRepositoryBase } from 'src/common/database/bases/database.repository';

@Injectable()
export class MeetingRepository extends DatabaseRepositoryBase<
    MeetingEntity,
    MeetingDoc
> {
    readonly _joinActive: PopulateOptions[] = [
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
            match: {
                isActive: true,
            },
        },
    ];

    constructor(
        @InjectDatabaseModel(MeetingEntity.name)
        private readonly bookingModel: Model<MeetingEntity>
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
