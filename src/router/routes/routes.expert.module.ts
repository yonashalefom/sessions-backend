import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UserExpertController } from 'src/modules/user/controllers/user.expert.controller';
import { UserModule } from 'src/modules/user/user.module';

@Module({
    controllers: [UserExpertController],
    providers: [],
    exports: [],
    imports: [UserModule, AuthModule],
})
export class RoutesExpertModule {}
