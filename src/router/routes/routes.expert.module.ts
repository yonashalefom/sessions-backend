import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { BookingModule } from 'src/modules/booking/booking.module';
import { BookingExpertController } from 'src/modules/booking/controllers/booking.expert.controller';
import { CategoryModule } from 'src/modules/category/category.module';
import { EventExpertController } from 'src/modules/events/controllers/event.expert.controller';
import { EventModule } from 'src/modules/events/event.module';
import { ExpertModule } from 'src/modules/expert/expert.module';
import { ScheduleExpertController } from 'src/modules/schedules/controllers/schedule.expert.controller';
import { ScheduleModule } from 'src/modules/schedules/schedule.module';
import { UserExpertController } from 'src/modules/user/controllers/user.expert.controller';
import { UserModule } from 'src/modules/user/user.module';

@Module({
    controllers: [
        UserExpertController,
        EventExpertController,
        ScheduleExpertController,
        BookingExpertController,
    ],
    providers: [],
    exports: [],
    imports: [
        UserModule,
        ExpertModule,
        AuthModule,
        CategoryModule,
        EventModule,
        ScheduleModule,
        BookingModule,
    ],
})
export class RoutesExpertModule {}
