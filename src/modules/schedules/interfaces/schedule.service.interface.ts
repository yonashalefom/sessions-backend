import {
    IDatabaseDeleteManyOptions,
    IDatabaseFindAllOptions,
    IDatabaseGetTotalOptions,
    IDatabaseOptions,
} from 'src/common/database/interfaces/database.interface';
import {
    ScheduleGetResponseDto,
    ScheduleListResponseDto,
    ScheduleShortResponseDto,
} from 'src/modules/schedules/dtos/response/schedule.get.response.dto';
import {
    ScheduleDoc,
    ScheduleEntity,
} from 'src/modules/schedules/repository/entities/schedule.entity';

export interface IScheduleService {
    findAll(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<ScheduleDoc[]>;
    findOne(
        find: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<ScheduleDoc>;
    checkScheduleAlreadyExists(
        name: string,
        owner: string,
        options?: IDatabaseOptions
    ): Promise<ScheduleDoc>;
    findOneById(_id: string, options?: IDatabaseOptions): Promise<ScheduleDoc>;
    findOneActiveById(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<ScheduleDoc>;
    getTotal(
        find?: Record<string, any>,
        options?: IDatabaseGetTotalOptions
    ): Promise<number>;
    deleteMany(
        find: Record<string, any>,
        options?: IDatabaseDeleteManyOptions
    ): Promise<boolean>;
    // createMany(
    //     data: ScheduleCreateRequestDto[],
    //     options?: IDatabaseCreateManyOptions
    // ): Promise<boolean>;
    mapList(
        countries: ScheduleDoc[] | ScheduleEntity[]
    ): Promise<ScheduleListResponseDto[]>;
    mapGet(
        category: ScheduleDoc | ScheduleEntity
    ): Promise<ScheduleGetResponseDto>;
    mapShort(
        categories: ScheduleDoc[] | ScheduleEntity[]
    ): Promise<ScheduleShortResponseDto[]>;
}
