import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_CONNECTION_NAME } from 'src/common/database/constants/database.constant';
import {
    ScheduleEntity,
    ScheduleSchema,
} from 'src/modules/schedules/repository/entities/schedule.entity';
import { ScheduleRepository } from 'src/modules/schedules/repository/repositories/schedule.repository';

@Module({
    providers: [ScheduleRepository],
    exports: [ScheduleRepository],
    controllers: [],
    imports: [
        MongooseModule.forFeature(
            [
                {
                    name: ScheduleEntity.name,
                    schema: ScheduleSchema,
                },
            ],
            DATABASE_CONNECTION_NAME
        ),
    ],
})
export class ScheduleRepositoryModule {}
