import {
    IDatabaseDeleteManyOptions,
    IDatabaseFindAllOptions,
    IDatabaseGetTotalOptions,
    IDatabaseOptions,
} from 'src/common/database/interfaces/database.interface';
import {
    MeetingGetResponseDto,
    MeetingListResponseDto,
    MeetingShortResponseDto,
} from 'src/modules/meeting/dtos/response/meeting.get.response.dto';
import {
    MeetingDoc,
    MeetingEntity,
} from 'src/modules/meeting/repository/entities/meeting.entity';

export interface IMeetingService {
    findAll(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<MeetingDoc[]>;
    findOne(
        find: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<MeetingDoc>;
    checkMeetingAlreadyExists(
        name: string,
        owner: string,
        options?: IDatabaseOptions
    ): Promise<MeetingDoc>;
    findOneById(_id: string, options?: IDatabaseOptions): Promise<MeetingDoc>;
    findOneActiveById(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<MeetingDoc>;
    getTotal(
        find?: Record<string, any>,
        options?: IDatabaseGetTotalOptions
    ): Promise<number>;
    deleteMany(
        find: Record<string, any>,
        options?: IDatabaseDeleteManyOptions
    ): Promise<boolean>;
    // createMany(
    //     data: MeetingCreateRequestDto[],
    //     options?: IDatabaseCreateManyOptions
    // ): Promise<boolean>;
    mapList(
        countries: MeetingDoc[] | MeetingEntity[]
    ): Promise<MeetingListResponseDto[]>;
    mapGet(
        category: MeetingDoc | MeetingEntity
    ): Promise<MeetingGetResponseDto>;
    mapShort(
        categories: MeetingDoc[] | MeetingEntity[]
    ): Promise<MeetingShortResponseDto[]>;
}
