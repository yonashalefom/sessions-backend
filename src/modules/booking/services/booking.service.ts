import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Document } from 'mongoose';
import { DatabaseQueryAnd } from 'src/common/database/decorators/database.decorator';
import {
    IDatabaseCreateOptions,
    IDatabaseDeleteManyOptions,
    IDatabaseFindAllOptions,
    IDatabaseGetTotalOptions,
    IDatabaseOptions,
    IDatabaseSaveOptions,
} from 'src/common/database/interfaces/database.interface';
import { HelperDateService } from 'src/common/helper/services/helper.date.service';
import { HelperURLService } from 'src/common/helper/services/helper.url.service';
import {
    BookingCreateRequestDto,
    CancelBookingRequestDto,
} from 'src/modules/booking/dtos/request/booking.create.request.dto';
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
import { EventDoc } from 'src/modules/events/repository/entities/event.entity';
import { SlotService } from 'src/modules/slot/services/slot.service';
import { DateRange } from 'src/modules/slot/types/types';

@Injectable()
export class BookingService implements IBookingService {
    constructor(
        private readonly bookingRepository: BookingRepository,
        private readonly slotService: SlotService,
        private readonly helperDateService: HelperDateService,
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

    async cancelBooking(
        repository: BookingDoc,
        { status, cancellationReason }: CancelBookingRequestDto,
        options?: IDatabaseSaveOptions
    ): Promise<BookingDoc> {
        repository.status = status;
        repository.cancellationReason = cancellationReason;

        return this.bookingRepository.save(repository, options);
    }

    async findOneById(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<BookingDoc> {
        console.log(JSON.stringify(options, null, 2));
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
            eventId,
            expertId,
            startTime,
            endTime,
            description,
            bookingRefType,
            meetingId,
            meetingUrl,
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
        create.bookingRef = {
            type: bookingRefType,
            meetingId,
            meetingUrl,
        };
        create.isActive = true;

        return this.bookingRepository.create<BookingEntity>(create, options);
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
        booking: BookingDoc | BookingEntity
    ): Promise<BookingShortResponseDto> {
        return plainToInstance(
            BookingShortResponseDto,
            booking instanceof Document ? booking.toObject() : booking
        );
    }

    async mapShort(
        bookings: BookingDoc[] | BookingEntity[]
    ): Promise<BookingShortResponseDto[]> {
        return plainToInstance(
            BookingShortResponseDto,
            bookings.map((booking: BookingDoc | BookingEntity) =>
                booking instanceof Document ? booking.toObject() : booking
            )
        );
    }

    validateAndGenerateDateRange(
        startTime: Date,
        eventDuration: number,
        userTimezone: string
    ): DateRange {
        const startDate = this.helperDateService.create(
            startTime,
            undefined,
            userTimezone
        );
        const endTime = this.helperDateService
            .forwardInMinutes(
                eventDuration,
                { fromDate: startDate },
                userTimezone
            )
            .toISOString();
        const endDate = this.helperDateService.create(
            endTime,
            undefined,
            userTimezone
        );

        const today = this.helperDateService.create(
            undefined,
            {
                startOfDay: true,
            },
            userTimezone
        );

        if (
            this.helperDateService.isBefore(startDate, today) ||
            this.helperDateService.isBefore(endDate, today)
        ) {
            throw new BadRequestException(
                'The date must be greater than or equal to today.'
            );
        }

        if (this.helperDateService.isBefore(endDate, startDate)) {
            throw new BadRequestException(
                'endDate cannot be behind startDate.'
            );
        }

        return { startDate, endDate };
    }

    async checkIfSlotIsBookableSlot(
        eventDoc: EventDoc,
        startDate: Date,
        endDate: Date,
        timezone: string
    ): Promise<boolean> {
        // Prepare the date range object
        const dateRange = {
            start: startDate,
            end: endDate,
            userTimezone: timezone, // Assuming 'user' is accessible in this context
        };

        // Fetch available slots
        const availableSlots = await this.slotService.getAvailableSlots(
            eventDoc as unknown as EventDoc,
            dateRange
        );

        // Check if the provided date range is a valid slot
        const isValidSlot = this.slotService.isValidSlot(
            startDate.toISOString(),
            endDate.toISOString(),
            availableSlots
        );

        // Return the validation result
        return isValidSlot;
    }
}
