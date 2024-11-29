import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CategoryModule } from 'src/modules/category/category.module';
import { EventExpertController } from 'src/modules/events/controllers/event.expert.controller';
import { EventModule } from 'src/modules/events/event.module';
import { ExpertModule } from 'src/modules/expert/expert.module';
import { UserExpertController } from 'src/modules/user/controllers/user.expert.controller';
import { UserModule } from 'src/modules/user/user.module';

@Module({
    controllers: [UserExpertController, EventExpertController],
    providers: [],
    exports: [],
    imports: [
        UserModule,
        ExpertModule,
        AuthModule,
        CategoryModule,
        EventModule,
    ],
})
export class RoutesExpertModule {}
