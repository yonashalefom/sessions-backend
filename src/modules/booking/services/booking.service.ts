import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Document } from 'mongoose';
import { DatabaseQueryAnd } from 'src/common/database/decorators/database.decorator';
import {
    IDatabaseCreateOptions,
    IDatabaseDeleteManyOptions,
    IDatabaseFindAllOptions,
    IDatabaseGetTotalOptions,
    IDatabaseOptions,
} from 'src/common/database/interfaces/database.interface';
import { HelperURLService } from 'src/common/helper/services/helper.url.service';
import { BookingCreateRequestDto } from 'src/modules/booking/dtos/request/booking.create.request.dto';
import {
    BookingGetResponseDto,
    BookingListResponseDto,
    BookingShortResponseDto,
} from 'src/modules/booking/dtos/response/booking.get.response.dto';
import { IBookingService } from 'src/modules/booking/interfaces/booking.service.interface';
import {
    BookingDoc,
    BookingEntity,
} from 'src/modules/booking/repository/entities/booking.entity';
import { BookingRepository } from 'src/modules/booking/repository/repositories/booking.repository';

@Injectable()
export class BookingService implements IBookingService {
    constructor(
        private readonly bookingRepository: BookingRepository,
        private readonly helperURLService: HelperURLService
    ) {}

    async findAll(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<BookingDoc[]> {
        return this.bookingRepository.findAll(find, options);
    }

    async findOne(
        find: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<BookingDoc> {
        return this.bookingRepository.findOne(find, options);
    }

    async checkBookingAlreadyExists(
        event: string,
        owner: string,
        options?: IDatabaseOptions
    ): Promise<BookingDoc> {
        console.log('Event is: ' + event);
        const find: any = DatabaseQueryAnd([{ title: event }, { owner }]);
        console.log('Find is: ' + JSON.stringify(find, null, 2));
        return this.bookingRepository.findOne(find, options);
    }

    async findOneById(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<BookingDoc> {
        return this.bookingRepository.findOneById(_id, options);
    }

    async findOneActiveById(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<BookingDoc> {
        return this.bookingRepository.findOne({ _id, isActive: true }, options);
    }

    async getTotal(
        find?: Record<string, any>,
        options?: IDatabaseGetTotalOptions
    ): Promise<number> {
        return this.bookingRepository.getTotal(find, options);
    }

    async deleteMany(
        find: Record<string, any>,
        options?: IDatabaseDeleteManyOptions
    ): Promise<boolean> {
        try {
            await this.bookingRepository.deleteMany(find, options);

            return true;
        } catch (error: unknown) {
            throw error;
        }
    }

    async create(
        {
            startTime,
            expertId,
            endTime,
            eventId,
            description,
        }: Partial<BookingCreateRequestDto>,
        userId: string,
        options?: IDatabaseCreateOptions
    ): Promise<BookingDoc> {
        const create: BookingEntity = new BookingEntity();
        create.eventId = eventId;
        create.userId = userId;
        create.expertId = expertId;
        create.description = description;
        create.startTime = startTime;
        create.endTime = endTime;
        // create.slug = this.helperURLService.slugify(title);
        // create.price = price;
        // create.duration = duration;
        create.isActive = true;

        console.log('Booking Data: ');
        console.log(JSON.stringify(create, null, 2));
        try {
            const as = await this.bookingRepository.create<BookingEntity>(
                create,
                options
            );
            console.log('KL: ' + JSON.stringify(as, null, 2));
            return as;
        } catch (err) {
            console.log(JSON.stringify(err.message, null, 2));
        }
    }

    // async createMany(
    //     data: EventCreateRequestDto[],
    //     options?: IDatabaseCreateManyOptions
    // ): Promise<boolean> {
    //     try {
    //         const entities: EventEntity[] = data.map(
    //             ({ title, description }): EventCreateRequestDto => {
    //                 const create: EventEntity = new EventEntity();
    //                 create.title = title;
    //                 create.description = description;
    //
    //                 return create;
    //             }
    //         ) as EventEntity[];
    //
    //         await this.bookingRepository.createMany(entities, options);
    //
    //         return true;
    //     } catch (error: unknown) {
    //         throw error;
    //     }
    // }

    async mapList(
        categories: BookingDoc[] | BookingEntity[]
    ): Promise<BookingListResponseDto[]> {
        return plainToInstance(
            BookingListResponseDto,
            categories.map((e: BookingDoc | BookingEntity) =>
                e instanceof Document ? e.toObject() : e
            )
        );
    }

    async mapGet(
        event: BookingDoc | BookingEntity
    ): Promise<BookingGetResponseDto> {
        return plainToInstance(
            BookingGetResponseDto,
            event instanceof Document ? event.toObject() : event
        );
    }

    async mapGetShort(
        event: BookingDoc | BookingEntity
    ): Promise<BookingShortResponseDto> {
        return plainToInstance(
            BookingShortResponseDto,
            event instanceof Document ? event.toObject() : event
        );
    }

    async mapShort(
        countries: BookingDoc[] | BookingEntity[]
    ): Promise<BookingShortResponseDto[]> {
        return plainToInstance(
            BookingShortResponseDto,
            countries.map((e: BookingDoc | BookingEntity) =>
                e instanceof Document ? e.toObject() : e
            )
        );
    }

    async filterValidExpertise(ids: string[]): Promise<string[]> {
        // Fetch only the IDs that exist in the database
        const existingExpertise = await this.findAll({ _id: { $in: ids } });

        // Extract the valid IDs
        const existingIds = existingExpertise.map(expertise =>
            expertise._id.toString()
        );

        // Return only the IDs that exist
        return ids.filter(id => existingIds.includes(id));
    }
}
