import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { AuthSharedController } from 'src/modules/auth/controllers/auth.shared.controller';
import { AwsModule } from 'src/modules/aws/aws.module';
import { BookingModule } from 'src/modules/booking/booking.module';
import { BookingSharedController } from 'src/modules/booking/controllers/booking.shared.controller';
import { CategoryModule } from 'src/modules/category/category.module';
import { CategorySharedController } from 'src/modules/category/controllers/category.shared.controller';
import { CountryModule } from 'src/modules/country/country.module';
import { EmailModule } from 'src/modules/email/email.module';
import { EventSharedController } from 'src/modules/events/controllers/event.shared.controller';
import { EventModule } from 'src/modules/events/event.module';
import { ScheduleSharedController } from 'src/modules/schedules/controllers/schedule.shared.controller';
import { ScheduleModule } from 'src/modules/schedules/schedule.module';
import { SlotModule } from 'src/modules/slot/slot.module';
import { UserSharedController } from 'src/modules/user/controllers/user.shared.controller';
import { UserModule } from 'src/modules/user/user.module';
import { WORKER_CONNECTION_NAME } from 'src/worker/constants/worker.constant';
import { ENUM_WORKER_QUEUES } from 'src/worker/enums/worker.enum';

@Module({
    controllers: [
        UserSharedController,
        AuthSharedController,
        CategorySharedController,
        EventSharedController,
        ScheduleSharedController,
        BookingSharedController,
    ],
    providers: [],
    exports: [],
    imports: [
        UserModule,
        CategoryModule,
        EventModule,
        ScheduleModule,
        SlotModule,
        EmailModule,
        AuthModule,
        AwsModule,
        CountryModule,
        BookingModule,
        BullModule.registerQueue({
            connection: {
                name: WORKER_CONNECTION_NAME,
            },
            name: ENUM_WORKER_QUEUES.EMAIL_QUEUE,
        }),
    ],
})
export class RoutesSharedModule {}
