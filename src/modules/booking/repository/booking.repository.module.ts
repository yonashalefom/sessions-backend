import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_CONNECTION_NAME } from 'src/common/database/constants/database.constant';
import {
    EventEntity,
    EventSchema,
} from 'src/modules/events/repository/entities/event.entity';
import { EventRepository } from 'src/modules/events/repository/repositories/event.repository';

@Module({
    providers: [EventRepository],
    exports: [EventRepository],
    controllers: [],
    imports: [
        MongooseModule.forFeature(
            [
                {
                    name: EventEntity.name,
                    schema: EventSchema,
                },
            ],
            DATABASE_CONNECTION_NAME
        ),
    ],
})
export class BookingRepositoryModule {}
