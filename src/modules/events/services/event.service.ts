import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import moment from 'moment-timezone';
import { Document } from 'mongoose';
import {
    DatabaseQueryAnd,
    DatabaseHelperQueryContain,
} from 'src/common/database/decorators/database.decorator';
import {
    IDatabaseCreateOptions,
    IDatabaseDeleteManyOptions,
    IDatabaseExistOptions,
    IDatabaseFindAllOptions,
    IDatabaseGetTotalOptions,
    IDatabaseOptions,
} from 'src/common/database/interfaces/database.interface';
import { HelperURLService } from 'src/common/helper/services/helper.url.service';
import { EventCreateRequestDto } from 'src/modules/events/dtos/request/event.create.request.dto';
import {
    EventGetResponseDto,
    EventShortResponseDto,
    EventListResponseDto,
} from 'src/modules/events/dtos/response/event.get.response.dto';
import { IEventService } from 'src/modules/events/interfaces/event.service.interface';
import {
    EventDoc,
    EventEntity,
} from 'src/modules/events/repository/entities/event.entity';
import { EventRepository } from 'src/modules/events/repository/repositories/event.repository';
import { splitTimeIntoIntervals } from 'src/modules/schedules/helpers/schedule.helper';
import { ScheduleService } from 'src/modules/schedules/services/schedule.service';

@Injectable()
export class EventService implements IEventService {
    constructor(
        private readonly eventRepository: EventRepository,
        private readonly helperURLService: HelperURLService,
        private readonly scheduleService: ScheduleService
    ) {}

    async findAll(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<EventDoc[]> {
        return this.eventRepository.findAll(find, options);
    }

    async findOne(
        find: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<EventDoc> {
        return this.eventRepository.findOne(find, options);
    }

    async checkEventAlreadyExists(
        event: string,
        owner: string,
        options?: IDatabaseOptions
    ): Promise<EventDoc> {
        console.log('Event is: ' + event);
        const find: any = DatabaseQueryAnd([{ title: event }, { owner }]);
        console.log('Find is: ' + JSON.stringify(find, null, 2));
        return this.eventRepository.findOne(find, options);
    }

    async findOneById(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<EventDoc> {
        return this.eventRepository.findOneById(_id, options);
    }

    async findOneActiveById(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<EventDoc> {
        return this.eventRepository.findOne({ _id, isActive: true }, options);
    }

    async getTotal(
        find?: Record<string, any>,
        options?: IDatabaseGetTotalOptions
    ): Promise<number> {
        return this.eventRepository.getTotal(find, options);
    }

    async deleteMany(
        find: Record<string, any>,
        options?: IDatabaseDeleteManyOptions
    ): Promise<boolean> {
        try {
            await this.eventRepository.deleteMany(find, options);

            return true;
        } catch (error: unknown) {
            throw error;
        }
    }

    async create(
        { title, description, price, duration }: EventCreateRequestDto,
        userId: string,
        options?: IDatabaseCreateOptions
    ): Promise<EventDoc> {
        const create: EventEntity = new EventEntity();
        create.owner = userId;
        create.title = title;
        create.description = description;
        create.slug = this.helperURLService.slugify(title);
        create.price = price;
        create.duration = duration;
        create.isActive = true;

        return this.eventRepository.create<EventEntity>(create, options);
    }

    // async exists(
    //     email: string,
    //     options?: IDatabaseExistOptions
    // ): Promise<boolean> {
    //     return this.eventRepository.exists(
    //         DatabaseHelperQueryContain('email', email, { fullWord: true }),
    //         { ...options, withDeleted: true }
    //     );
    // }

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

    async getAvailableSlots(
        eventId: string,
        dateRange: { start: Date; end: Date }
    ) {
        // Fetch Event and Expert's Schedule
        const event = await this.eventRepository.findOneById(eventId);
        console.log('Event Is:');
        console.log(JSON.stringify(event, null, 2));
        const schedules = await this.scheduleService.findAll({
            userId: event.owner,
            isActive: true,
        });
        console.log();
        console.log('Schedules Are:');
        console.log(JSON.stringify(schedules, null, 2));
        console.log();

        const availableSlots = [];

        for (const schedule of schedules) {
            console.log('******************************');
            console.log('Current Schedule');
            console.log('******************************');
            console.log(JSON.stringify(schedule, null, 2));
            for (const availability of schedule.availability) {
                // Generate intervals for each day in availability
                const days = availability.days;
                console.log('Current Schedule Availability Days: ');
                console.log(JSON.stringify(days, null, 2));
                // Iterate through the date range
                const startDate = moment(dateRange.start);
                const endDate = moment(dateRange.end);
                console.log('--------------------------------');
                console.log(startDate);
                console.log(endDate);
                console.log('--------------------------------');

                while (startDate.isBefore(endDate)) {
                    console.log(
                        'Date Range ' +
                            startDate.format() +
                            ' is Before: ' +
                            endDate.format()
                    );

                    if (days.includes(startDate.isoWeekday())) {
                        // Generate time slots for the day
                        const slots = splitTimeIntoIntervals(
                            startDate.format('YYYY-MM-DD'),
                            endDate.format('YYYY-MM-DD'),
                            availability.startTime,
                            availability.endTime,
                            event.duration,
                            schedule.timeZone
                        );

                        console.log('--------------------------------');
                        console.log(JSON.stringify(slots, null, 2));
                        console.log('--------------------------------');

                        for (const slot of slots) {
                            const adjustedSlotStart = moment(slot).add(
                                event.bookingOffsetMinutes,
                                'minutes'
                            );

                            console.log(
                                'adjustedSlotStart: ' +
                                    adjustedSlotStart.format()
                            );

                            // Exclude conflicted slots
                            const isConflicted =
                                await this.eventRepository.exists({
                                    owner: event.owner,
                                    eventStartDate: {
                                        $lte: adjustedSlotStart.toDate(),
                                    },
                                    $expr: {
                                        $gt: [
                                            {
                                                $add: [
                                                    '$eventStartDate',
                                                    {
                                                        $multiply: [
                                                            '$duration',
                                                            60000,
                                                        ],
                                                    },
                                                ],
                                            },
                                            adjustedSlotStart.toDate(),
                                        ],
                                    },
                                });

                            if (!isConflicted) {
                                availableSlots.push(
                                    adjustedSlotStart.toISOString()
                                );
                            }
                        }
                    }
                    startDate.add(1, 'day');
                }
            }
        }

        return availableSlots;
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
    //         await this.eventRepository.createMany(entities, options);
    //
    //         return true;
    //     } catch (error: unknown) {
    //         throw error;
    //     }
    // }

    async mapList(
        categories: EventDoc[] | EventEntity[]
    ): Promise<EventListResponseDto[]> {
        return plainToInstance(
            EventListResponseDto,
            categories.map((e: EventDoc | EventEntity) =>
                e instanceof Document ? e.toObject() : e
            )
        );
    }

    async mapGet(event: EventDoc | EventEntity): Promise<EventGetResponseDto> {
        return plainToInstance(
            EventGetResponseDto,
            event instanceof Document ? event.toObject() : event
        );
    }

    async mapGetShort(
        event: EventDoc | EventEntity
    ): Promise<EventShortResponseDto> {
        return plainToInstance(
            EventShortResponseDto,
            event instanceof Document ? event.toObject() : event
        );
    }

    async mapShort(
        countries: EventDoc[] | EventEntity[]
    ): Promise<EventShortResponseDto[]> {
        return plainToInstance(
            EventShortResponseDto,
            countries.map((e: EventDoc | EventEntity) =>
                e instanceof Document ? e.toObject() : e
            )
        );
    }
}
