import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { ENUM_SCHEDULE_STATUS_CODE_ERROR } from 'src/modules/schedules/enums/schedule.status-code.enum';
import { ScheduleDoc } from 'src/modules/schedules/repository/entities/schedule.entity';
import { ScheduleService } from 'src/modules/schedules/services/schedule.service';

@Injectable()
export class ScheduleParsePipe implements PipeTransform {
    constructor(private readonly scheduleService: ScheduleService) {}

    async transform(value: any): Promise<ScheduleDoc> {
        const schedule: ScheduleDoc =
            await this.scheduleService.findOneById(value);

        if (!schedule) {
            throw new NotFoundException({
                statusCode: ENUM_SCHEDULE_STATUS_CODE_ERROR.NOT_FOUND,
                message: 'schedule.error.notFound',
            });
        }

        return schedule;
    }
}
