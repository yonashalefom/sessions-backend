import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { BookingModule } from 'src/modules/booking/booking.module';
import { BookingUserController } from 'src/modules/booking/controllers/booking.user.controller';
import { CategoryModule } from 'src/modules/category/category.module';
import { EventModule } from 'src/modules/events/event.module';
import { ExpertUserController } from 'src/modules/expert/controllers/expert.user.controller';
import { ScheduleModule } from 'src/modules/schedules/schedule.module';
import { SlotModule } from 'src/modules/slot/slot.module';
import { UserUserController } from 'src/modules/user/controllers/user.user.controller';
import { UserModule } from 'src/modules/user/user.module';

@Module({
    controllers: [
        UserUserController,
        ExpertUserController,
        BookingUserController,
    ],
    providers: [],
    exports: [],
    imports: [
        UserModule,
        AuthModule,
        CategoryModule,
        BookingModule,
        EventModule,
        ScheduleModule,
        SlotModule,
    ],
})
export class RoutesUserModule {}
