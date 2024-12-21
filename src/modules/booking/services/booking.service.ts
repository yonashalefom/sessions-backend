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

@Injectable()
export class BookingService implements IEventService {
    constructor(
        private readonly eventRepository: EventRepository,
        private readonly helperURLService: HelperURLService
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
