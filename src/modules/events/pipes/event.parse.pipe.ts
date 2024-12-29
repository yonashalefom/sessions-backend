import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { ENUM_EVENT_STATUS_CODE_ERROR } from 'src/modules/events/enums/event.status-code.enum';
import { EventDoc } from 'src/modules/events/repository/entities/event.entity';
import { EventService } from 'src/modules/events/services/event.service';

@Injectable()
export class EventParsePipe implements PipeTransform {
    constructor(private readonly eventService: EventService) {}

    async transform(value: any): Promise<EventDoc> {
        const event: EventDoc = await this.eventService.findOneById(value, {
            join: true,
        });

        if (!event) {
            throw new NotFoundException({
                statusCode: ENUM_EVENT_STATUS_CODE_ERROR.NOT_FOUND,
                message: 'event.error.notFound',
            });
        }

        return event;
    }
}
