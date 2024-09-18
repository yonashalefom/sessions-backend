import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ExpertUserController } from 'src/modules/expert/controllers/expert.user.controller';
import { UserUserController } from 'src/modules/user/controllers/user.user.controller';
import { UserModule } from 'src/modules/user/user.module';

@Module({
    controllers: [UserUserController, ExpertUserController],
    providers: [],
    exports: [],
    imports: [UserModule, AuthModule],
})
export class RoutesUserModule {}
