import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectDatabaseModel } from 'src/common/database/decorators/database.decorator';
import {
    ScheduleDoc,
    ScheduleEntity,
} from 'src/modules/schedules/repository/entities/schedule.entity';
import { DatabaseRepositoryBase } from 'src/common/database/bases/database.repository';

@Injectable()
export class ScheduleRepository extends DatabaseRepositoryBase<
    ScheduleEntity,
    ScheduleDoc
> {
    constructor(
        @InjectDatabaseModel(ScheduleEntity.name)
        private readonly eventModel: Model<ScheduleEntity>
    ) {
        super(eventModel);
    }
}
