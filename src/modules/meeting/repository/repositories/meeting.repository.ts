import { Injectable } from '@nestjs/common';
import { Model, PopulateOptions } from 'mongoose';
import { DatabaseRepositoryAbstract } from 'src/common/database/abstracts/database.repository.abstract';
import { DatabaseModel } from 'src/common/database/decorators/database.decorator';
import { EventEntity } from 'src/modules/events/repository/entities/event.entity';
import {
    MeetingDoc,
    MeetingEntity,
} from 'src/modules/meeting/repository/entities/meeting.entity';
import { UserEntity } from 'src/modules/user/repository/entities/user.entity';

@Injectable()
export class MeetingRepository extends DatabaseRepositoryAbstract<
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
        @DatabaseModel(MeetingEntity.name)
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
