import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { ENUM_CATEGORY_STATUS_CODE_ERROR } from 'src/modules/category/enums/category.status-code.enum';
import { ScheduleDoc } from 'src/modules/schedules/repository/entities/schedule.entity';
import { ScheduleService } from 'src/modules/schedules/services/schedule.service';

@Injectable()
export class ScheduleParsePipe implements PipeTransform {
    constructor(private readonly scheduleService: ScheduleService) {}

    async transform(value: any): Promise<ScheduleDoc> {
        const event: ScheduleDoc =
            await this.scheduleService.findOneById(value);

        if (!event) {
            throw new NotFoundException({
                statusCode: ENUM_CATEGORY_STATUS_CODE_ERROR.NOT_FOUND,
                message: 'schedule.error.notFound',
            });
        }

        return event;
    }
}
