import { ENUM_SCHEDULE_DAYS } from 'src/modules/schedules/enums/schedule.enum';

export class AvailabilityDto {
    days: ENUM_SCHEDULE_DAYS[];
    startTime: string;
    endTime: string;
}

export class ScheduleCreateRequestDto {
    title: string;
    timeZone: string;
    availability: AvailabilityDto[];
}
