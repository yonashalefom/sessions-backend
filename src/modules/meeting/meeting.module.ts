import { Module } from '@nestjs/common';
import { EventModule } from 'src/modules/events/event.module';
import { MeetingRepositoryModule } from 'src/modules/meeting/repository/meeting.repository.module';
import { MeetingService } from 'src/modules/meeting/services/meeting.service';
import { ScheduleModule } from 'src/modules/schedules/schedule.module';

@Module({
    imports: [MeetingRepositoryModule, EventModule, ScheduleModule],
    exports: [MeetingService],
    providers: [MeetingService],
    controllers: [],
})
export class MeetingModule {}
