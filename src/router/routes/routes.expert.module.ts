import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CategoryModule } from 'src/modules/category/category.module';
import { ExpertModule } from 'src/modules/expert/expert.module';
import { UserExpertController } from 'src/modules/user/controllers/user.expert.controller';
import { UserModule } from 'src/modules/user/user.module';

@Module({
    controllers: [UserExpertController],
    providers: [],
    exports: [],
    imports: [UserModule, ExpertModule, AuthModule, CategoryModule],
})
export class RoutesExpertModule {}
