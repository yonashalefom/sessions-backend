import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { DatabaseRepositoryAbstract } from 'src/common/database/abstracts/database.repository.abstract';
import { DatabaseModel } from 'src/common/database/decorators/database.decorator';
import {
    ScheduleDoc,
    ScheduleEntity,
} from 'src/modules/schedules/repository/entities/schedule.entity';

@Injectable()
export class ScheduleRepository extends DatabaseRepositoryAbstract<
    ScheduleEntity,
    ScheduleDoc
> {
    constructor(
        @DatabaseModel(ScheduleEntity.name)
        private readonly eventModel: Model<ScheduleEntity>
    ) {
        super(eventModel);
    }
}
