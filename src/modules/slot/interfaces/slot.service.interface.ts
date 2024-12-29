import { EventDoc } from 'src/modules/events/repository/entities/event.entity';
import { SlotDto } from 'src/modules/slot/dtos/response/slot.get.response.dto';
import { DateRangeWithTimezone } from 'src/modules/slot/types/typs';

export interface ISlotService {
    getAvailableSlots(
        expertEvent: EventDoc,
        dateRange: DateRangeWithTimezone
    ): Promise<Record<string, SlotDto[]>>;
    // findAll(
    //     find?: Record<string, any>,
    //     options?: IDatabaseFindAllOptions
    // ): Promise<ScheduleDoc[]>;
    // findOne(
    //     find: Record<string, any>,
    //     options?: IDatabaseOptions
    // ): Promise<ScheduleDoc>;
    // checkScheduleAlreadyExists(
    //     name: string,
    //     owner: string,
    //     options?: IDatabaseOptions
    // ): Promise<ScheduleDoc>;
    // findOneById(_id: string, options?: IDatabaseOptions): Promise<ScheduleDoc>;
    // findOneActiveById(
    //     _id: string,
    //     options?: IDatabaseOptions
    // ): Promise<ScheduleDoc>;
    // getTotal(
    //     find?: Record<string, any>,
    //     options?: IDatabaseGetTotalOptions
    // ): Promise<number>;
    // deleteMany(
    //     find: Record<string, any>,
    //     options?: IDatabaseDeleteManyOptions
    // ): Promise<boolean>;
    // // createMany(
    // //     data: ScheduleCreateRequestDto[],
    // //     options?: IDatabaseCreateManyOptions
    // // ): Promise<boolean>;
    // mapList(
    //     countries: ScheduleDoc[] | ScheduleEntity[]
    // ): Promise<ScheduleListResponseDto[]>;
    // mapGet(
    //     category: ScheduleDoc | ScheduleEntity
    // ): Promise<ScheduleGetResponseDto>;
    // mapShort(
    //     categories: ScheduleDoc[] | ScheduleEntity[]
    // ): Promise<ScheduleShortResponseDto[]>;
}
