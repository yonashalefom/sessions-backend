import { Module } from '@nestjs/common';
import { EventRepositoryModule } from 'src/modules/events/repository/event.repository.module';
import { EventService } from 'src/modules/events/services/event.service';
import { ScheduleModule } from 'src/modules/schedules/schedule.module';

@Module({
    imports: [EventRepositoryModule, ScheduleModule],
    exports: [EventService],
    providers: [EventService],
    controllers: [],
})
export class EventModule {}
