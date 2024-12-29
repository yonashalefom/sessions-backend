import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_CONNECTION_NAME } from 'src/common/database/constants/database.constant';
import {
    BookingEntity,
    BookingSchema,
} from 'src/modules/booking/repository/entities/booking.entity';
import { BookingRepository } from 'src/modules/booking/repository/repositories/booking.repository';

@Module({
    providers: [BookingRepository],
    exports: [BookingRepository],
    controllers: [],
    imports: [
        MongooseModule.forFeature(
            [
                {
                    name: BookingEntity.name,
                    schema: BookingSchema,
                },
            ],
            DATABASE_CONNECTION_NAME
        ),
    ],
})
export class BookingRepositoryModule {}
