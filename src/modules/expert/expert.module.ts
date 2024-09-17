import { Module } from '@nestjs/common';
import { UserModule } from 'src/modules/user/user.module';

@Module({
    imports: [UserModule],
    exports: [],
    providers: [],
    controllers: [],
})
export class ExpertModule {}
