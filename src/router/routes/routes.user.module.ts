import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ActivityModule } from 'src/modules/activity/activity.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CountryModule } from 'src/modules/country/country.module';
import { SessionModule } from 'src/modules/session/session.module';
import { UserUserController } from 'src/modules/user/controllers/user.user.controller';
import { UserModule } from 'src/modules/user/user.module';
import { VerificationUserController } from 'src/modules/verification/controllers/verification.user.controller';
import { VerificationModule } from 'src/modules/verification/verification.module';
import { ENUM_WORKER_QUEUES } from 'src/worker/enums/worker.enum';
import { ExpertUserController } from 'src/modules/expert/controllers/expert.user.controller';
import { BookingUserController } from 'src/modules/booking/controllers/booking.user.controller';
import { SlotUserController } from 'src/modules/slot/controllers/slot.user.controller';
import { CategoryModule } from 'src/modules/category/category.module';
import { BookingModule } from 'src/modules/booking/booking.module';
import { EventModule } from 'src/modules/events/event.module';
import { ScheduleModule } from 'src/modules/schedules/schedule.module';
import { SlotModule } from 'src/modules/slot/slot.module';
import { MeetingModule } from 'src/modules/meeting/meeting.module';

@Module({
    controllers: [
        UserUserController,
        VerificationUserController,
        ExpertUserController,
        BookingUserController,
        SlotUserController,
    ],
    providers: [],
    exports: [],
    imports: [
        UserModule,
        AuthModule,
        ActivityModule,
        SessionModule,
        CountryModule,
        VerificationModule,
        CategoryModule,
        BookingModule,
        EventModule,
        ScheduleModule,
        SlotModule,
        MeetingModule,
        BullModule.registerQueueAsync({
            name: ENUM_WORKER_QUEUES.EMAIL_QUEUE,
        }),
        BullModule.registerQueueAsync({
            name: ENUM_WORKER_QUEUES.SMS_QUEUE,
        }),
    ],
})
export class RoutesUserModule {}
