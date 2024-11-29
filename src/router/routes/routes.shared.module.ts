import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { AuthSharedController } from 'src/modules/auth/controllers/auth.shared.controller';
import { AwsModule } from 'src/modules/aws/aws.module';
import { CategoryModule } from 'src/modules/category/category.module';
import { CategorySharedController } from 'src/modules/category/controllers/category.shared.controller';
import { CountryModule } from 'src/modules/country/country.module';
import { EmailModule } from 'src/modules/email/email.module';
import { EventSharedController } from 'src/modules/events/controllers/event.shared.controller';
import { EventModule } from 'src/modules/events/event.module';
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
    ],
    providers: [],
    exports: [],
    imports: [
        UserModule,
        CategoryModule,
        EventModule,
        EmailModule,
        AuthModule,
        AwsModule,
        CountryModule,
        BullModule.registerQueue({
            connection: {
                name: WORKER_CONNECTION_NAME,
            },
            name: ENUM_WORKER_QUEUES.EMAIL_QUEUE,
        }),
    ],
})
export class RoutesSharedModule {}
