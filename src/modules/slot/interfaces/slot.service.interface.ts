import { EventDoc } from 'src/modules/events/repository/entities/event.entity';
import { SlotDto } from 'src/modules/slot/dtos/response/slot.get.response.dto';
import { DateRange, DateRangeWithTimezone } from 'src/modules/slot/types/types';

export interface ISlotService {
    getAvailableSlots(
        expertEvent: EventDoc,
        dateRange: DateRangeWithTimezone
    ): Promise<Record<string, SlotDto[]>>;
    validateDateRange(userTimezone: string, start: Date, end: Date): DateRange;
}
