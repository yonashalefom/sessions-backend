import { Module } from '@nestjs/common';
import { EventModule } from 'src/modules/events/event.module';
import { ScheduleModule } from 'src/modules/schedules/schedule.module';
import { SlotService } from 'src/modules/slot/services/slot.service';

@Module({
    imports: [EventModule, ScheduleModule],
    exports: [SlotService],
    providers: [SlotService],
    controllers: [],
})
export class SlotModule {}
