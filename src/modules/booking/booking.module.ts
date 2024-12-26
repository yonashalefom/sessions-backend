import { Module } from '@nestjs/common';
import { BookingRepositoryModule } from 'src/modules/booking/repository/booking.repository.module';
import { BookingService } from 'src/modules/booking/services/booking.service';
import { EventModule } from 'src/modules/events/event.module';
import { MeetingModule } from 'src/modules/meeting/meeting.module';
import { ScheduleModule } from 'src/modules/schedules/schedule.module';

@Module({
    imports: [
        BookingRepositoryModule,
        EventModule,
        ScheduleModule,
        MeetingModule,
    ],
    exports: [BookingService],
    providers: [BookingService],
    controllers: [],
})
export class BookingModule {}
