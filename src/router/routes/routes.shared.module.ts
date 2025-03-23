import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ActivityModule } from 'src/modules/activity/activity.module';
import { ActivitySharedController } from 'src/modules/activity/controllers/activity.shared.controller';
import { AuthModule } from 'src/modules/auth/auth.module';
import { AuthSharedController } from 'src/modules/auth/controllers/auth.shared.controller';
import { AwsModule } from 'src/modules/aws/aws.module';
import { CountryModule } from 'src/modules/country/country.module';
import { EmailModule } from 'src/modules/email/email.module';
import { PasswordHistorySharedController } from 'src/modules/password-history/controllers/password-history.shared.controller';
import { PasswordHistoryModule } from 'src/modules/password-history/password-history.module';
import { SessionSharedController } from 'src/modules/session/controllers/session.shared.controller';
import { SessionModule } from 'src/modules/session/session.module';
import { UserSharedController } from 'src/modules/user/controllers/user.shared.controller';
import { UserModule } from 'src/modules/user/user.module';
import { ENUM_WORKER_QUEUES } from 'src/worker/enums/worker.enum';
import { CategorySharedController } from 'src/modules/category/controllers/category.shared.controller';
import { EventSharedController } from 'src/modules/events/controllers/event.shared.controller';
import { ScheduleSharedController } from 'src/modules/schedules/controllers/schedule.shared.controller';
import { BookingSharedController } from 'src/modules/booking/controllers/booking.shared.controller';
import { CategoryModule } from 'src/modules/category/category.module';
import { EventModule } from 'src/modules/events/event.module';
import { ScheduleModule } from 'src/modules/schedules/schedule.module';
import { SlotModule } from 'src/modules/slot/slot.module';
import { BookingModule } from 'src/modules/booking/booking.module';

@Module({
    controllers: [
        UserSharedController,
        AuthSharedController,
        SessionSharedController,
        PasswordHistorySharedController,
        ActivitySharedController,
        CategorySharedController,
        EventSharedController,
        ScheduleSharedController,
        BookingSharedController,
    ],
    providers: [],
    exports: [],
    imports: [
        UserModule,
        EmailModule,
        AuthModule,
        AwsModule,
        CountryModule,
        SessionModule,
        PasswordHistoryModule,
        ActivityModule,
        CategoryModule,
        EventModule,
        ScheduleModule,
        SlotModule,
        BookingModule,
        BullModule.registerQueueAsync({
            name: ENUM_WORKER_QUEUES.EMAIL_QUEUE,
        }),
    ],
})
export class RoutesSharedModule {}
