import { Module } from '@nestjs/common';
import { EventRepositoryModule } from 'src/modules/events/repository/event.repository.module';
import { EventService } from 'src/modules/events/services/event.service';

@Module({
    imports: [EventRepositoryModule],
    exports: [EventService],
    providers: [EventService],
    controllers: [],
})
export class BookingModule {}
