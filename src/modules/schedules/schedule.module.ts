import { Module } from '@nestjs/common';
import { ScheduleRepositoryModule } from 'src/modules/schedules/repository/schedule.repository.module';
import { ScheduleService } from 'src/modules/schedules/services/schedule.service';

@Module({
    imports: [ScheduleRepositoryModule],
    exports: [ScheduleService],
    providers: [ScheduleService],
    controllers: [],
})
export class ScheduleModule {}
