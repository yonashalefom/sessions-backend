import {
    IDatabaseDeleteManyOptions,
    IDatabaseFindAllOptions,
    IDatabaseGetTotalOptions,
    IDatabaseOptions,
} from 'src/common/database/interfaces/database.interface';
import {
    EventGetResponseDto,
    EventListResponseDto,
    EventShortResponseDto,
} from 'src/modules/events/dtos/response/event.get.response.dto';
import {
    EventDoc,
    EventEntity,
} from 'src/modules/events/repository/entities/event.entity';

export interface IEventService {
    findAll(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<EventDoc[]>;
    findOne(
        find: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<EventDoc>;
    checkEventAlreadyExists(
        name: string,
        owner: string,
        options?: IDatabaseOptions
    ): Promise<EventDoc>;
    findOneById(_id: string, options?: IDatabaseOptions): Promise<EventDoc>;
    findOneActiveById(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<EventDoc>;
    getTotal(
        find?: Record<string, any>,
        options?: IDatabaseGetTotalOptions
    ): Promise<number>;
    deleteMany(
        find: Record<string, any>,
        options?: IDatabaseDeleteManyOptions
    ): Promise<boolean>;
    // createMany(
    //     data: EventCreateRequestDto[],
    //     options?: IDatabaseCreateManyOptions
    // ): Promise<boolean>;
    mapList(
        countries: EventDoc[] | EventEntity[]
    ): Promise<EventListResponseDto[]>;
    mapGet(category: EventDoc | EventEntity): Promise<EventGetResponseDto>;
    mapShort(
        categories: EventDoc[] | EventEntity[]
    ): Promise<EventShortResponseDto[]>;
}
