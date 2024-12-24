import {
    IDatabaseDeleteManyOptions,
    IDatabaseFindAllOptions,
    IDatabaseGetTotalOptions,
    IDatabaseOptions,
} from 'src/common/database/interfaces/database.interface';
import {
    BookingGetResponseDto,
    BookingListResponseDto,
    BookingShortResponseDto,
} from 'src/modules/booking/dtos/response/booking.get.response.dto';
import {
    BookingDoc,
    BookingEntity,
} from 'src/modules/booking/repository/entities/booking.entity';

export interface IBookingService {
    findAll(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<BookingDoc[]>;
    findOne(
        find: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<BookingDoc>;
    checkBookingAlreadyExists(
        name: string,
        owner: string,
        options?: IDatabaseOptions
    ): Promise<BookingDoc>;
    findOneById(_id: string, options?: IDatabaseOptions): Promise<BookingDoc>;
    findOneActiveById(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<BookingDoc>;
    getTotal(
        find?: Record<string, any>,
        options?: IDatabaseGetTotalOptions
    ): Promise<number>;
    deleteMany(
        find: Record<string, any>,
        options?: IDatabaseDeleteManyOptions
    ): Promise<boolean>;
    // createMany(
    //     data: BookingCreateRequestDto[],
    //     options?: IDatabaseCreateManyOptions
    // ): Promise<boolean>;
    mapList(
        countries: BookingDoc[] | BookingEntity[]
    ): Promise<BookingListResponseDto[]>;
    mapGet(
        category: BookingDoc | BookingEntity
    ): Promise<BookingGetResponseDto>;
    mapShort(
        categories: BookingDoc[] | BookingEntity[]
    ): Promise<BookingShortResponseDto[]>;
}
