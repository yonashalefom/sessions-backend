import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { ENUM_CATEGORY_STATUS_CODE_ERROR } from 'src/modules/category/enums/category.status-code.enum';
import { EventDoc } from 'src/modules/events/repository/entities/event.entity';
import { EventService } from 'src/modules/events/services/event.service';

@Injectable()
export class EventParsePipe implements PipeTransform {
    constructor(private readonly eventService: EventService) {}

    async transform(value: any): Promise<EventDoc> {
        const event: EventDoc = await this.eventService.findOneById(value);

        if (!event) {
            throw new NotFoundException({
                statusCode: ENUM_CATEGORY_STATUS_CODE_ERROR.NOT_FOUND,
                message: 'category.error.notFound',
            });
        }

        return event;
    }
}
