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
import { HelperDateService } from 'src/common/helper/services/helper.date.service';
import { HelperURLService } from 'src/common/helper/services/helper.url.service';
import { ScheduleCreateRequestDto } from 'src/modules/schedules/dtos/request/schedule.create.request.dto';
import {
    ScheduleGetResponseDto,
    ScheduleListResponseDto,
    ScheduleShortResponseDto,
} from 'src/modules/schedules/dtos/response/schedule.get.response.dto';
import { IScheduleService } from 'src/modules/schedules/interfaces/schedule.service.interface';
import {
    ScheduleDoc,
    ScheduleEntity,
} from 'src/modules/schedules/repository/entities/schedule.entity';
import { ScheduleRepository } from 'src/modules/schedules/repository/repositories/schedule.repository';

@Injectable()
export class ScheduleService implements IScheduleService {
    constructor(
        private readonly scheduleRepository: ScheduleRepository,
        private readonly helperDateService: HelperDateService,
        private readonly helperURLService: HelperURLService
    ) {}

    async findAll(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<ScheduleDoc[]> {
        return this.scheduleRepository.findAll(find, options);
    }

    async findOne(
        find: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<ScheduleDoc> {
        return this.scheduleRepository.findOne(find, options);
    }

    async checkScheduleAlreadyExists(
        title: string,
        userId: string,
        options?: IDatabaseOptions
    ): Promise<ScheduleDoc> {
        console.log('Event is: ' + title);
        const find: any = DatabaseQueryAnd([{ title }, { userId }]);
        console.log('Find is: ' + JSON.stringify(find, null, 2));
        return this.scheduleRepository.findOne(find, options);
    }

    async findOneById(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<ScheduleDoc> {
        return this.scheduleRepository.findOneById(_id, options);
    }

    async findOneActiveById(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<ScheduleDoc> {
        return this.scheduleRepository.findOne(
            { _id, isActive: true },
            options
        );
    }

    async getTotal(
        find?: Record<string, any>,
        options?: IDatabaseGetTotalOptions
    ): Promise<number> {
        return this.scheduleRepository.getTotal(find, options);
    }

    async deleteMany(
        find: Record<string, any>,
        options?: IDatabaseDeleteManyOptions
    ): Promise<boolean> {
        try {
            await this.scheduleRepository.deleteMany(find, options);

            return true;
        } catch (error: unknown) {
            throw error;
        }
    }

    async create(
        { title, timeZone, availability }: ScheduleCreateRequestDto,
        userId: string,
        options?: IDatabaseCreateOptions
    ): Promise<ScheduleDoc> {
        const create: ScheduleEntity = new ScheduleEntity();
        create.userId = userId;
        create.title = title;
        create.timeZone = timeZone;
        create.availability = availability;
        create.isActive = true;

        return this.scheduleRepository.create<ScheduleEntity>(create, options);
    }

    // async createMany(
    //     data: ScheduleCreateRequestDto[],
    //     options?: IDatabaseCreateManyOptions
    // ): Promise<boolean> {
    //     try {
    //         const entities: ScheduleEntity[] = data.map(
    //             ({ title, description }): ScheduleCreateRequestDto => {
    //                 const create: ScheduleEntity = new ScheduleEntity();
    //                 create.title = title;
    //                 create.description = description;
    //
    //                 return create;
    //             }
    //         ) as ScheduleEntity[];
    //
    //         await this.scheduleRepository.createMany(entities, options);
    //
    //         return true;
    //     } catch (error: unknown) {
    //         throw error;
    //     }
    // }

    checkAvailabilityOverlap(
        newAvailability,
        existingAvailability,
        newTimeZone: string,
        existingTimeZone: string
    ): boolean {
        for (const existing of existingAvailability) {
            const newDays = new Set(newAvailability.days);
            const commonDays = existing.days.filter(day => newDays.has(day));

            if (commonDays.length > 0) {
                const newStartUTC = this.helperDateService.timeToUTC(
                    newAvailability.startTime,
                    newTimeZone
                );
                const newEndUTC = this.helperDateService.timeToUTC(
                    newAvailability.endTime,
                    newTimeZone
                );

                const existingStartUTC = this.helperDateService.timeToUTC(
                    existing.startTime,
                    existingTimeZone
                );
                const existingEndUTC = this.helperDateService.timeToUTC(
                    existing.endTime,
                    existingTimeZone
                );

                if (
                    newStartUTC < existingEndUTC &&
                    newEndUTC > existingStartUTC
                ) {
                    return true; // Overlap detected
                }
            }
        }
        return false;
    }

    // region Map Responses
    async mapList(
        categories: ScheduleDoc[] | ScheduleEntity[]
    ): Promise<ScheduleListResponseDto[]> {
        return plainToInstance(
            ScheduleListResponseDto,
            categories.map((e: ScheduleDoc | ScheduleEntity) =>
                e instanceof Document ? e.toObject() : e
            )
        );
    }

    async mapGet(
        schedule: ScheduleDoc | ScheduleEntity
    ): Promise<ScheduleGetResponseDto> {
        return plainToInstance(
            ScheduleGetResponseDto,
            schedule instanceof Document ? schedule.toObject() : schedule
        );
    }

    async mapGetShort(
        schedule: ScheduleDoc | ScheduleEntity
    ): Promise<ScheduleShortResponseDto> {
        return plainToInstance(
            ScheduleShortResponseDto,
            schedule instanceof Document ? schedule.toObject() : schedule
        );
    }

    async mapShort(
        countries: ScheduleDoc[] | ScheduleEntity[]
    ): Promise<ScheduleShortResponseDto[]> {
        return plainToInstance(
            ScheduleShortResponseDto,
            countries.map((e: ScheduleDoc | ScheduleEntity) =>
                e instanceof Document ? e.toObject() : e
            )
        );
    }
    // endregion
}
