import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_CONNECTION_NAME } from 'src/common/database/constants/database.constant';
import {
    MeetingEntity,
    MeetingSchema,
} from 'src/modules/meeting/repository/entities/meeting.entity';
import { MeetingRepository } from 'src/modules/meeting/repository/repositories/meeting.repository';

@Module({
    providers: [MeetingRepository],
    exports: [MeetingRepository],
    controllers: [],
    imports: [
        MongooseModule.forFeature(
            [
                {
                    name: MeetingEntity.name,
                    schema: MeetingSchema,
                },
            ],
            DATABASE_CONNECTION_NAME
        ),
    ],
})
export class MeetingRepositoryModule {}
