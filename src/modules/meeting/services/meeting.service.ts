import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetRateLimitsResponse, StreamClient } from '@stream-io/node-sdk';
import { StreamResponse } from '@stream-io/node-sdk/dist/src/types';
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
import { HelperURLService } from 'src/common/helper/services/helper.url.service';
import {
    CancelMeetingRequestDto,
    MeetingCreateRequestDto,
} from 'src/modules/meeting/dtos/request/meeting.create.request.dto';
import {
    MeetingGetResponseDto,
    MeetingListResponseDto,
    MeetingShortResponseDto,
} from 'src/modules/meeting/dtos/response/meeting.get.response.dto';
import { IMeetingService } from 'src/modules/meeting/interfaces/meeting.service.interface';
import {
    MeetingDoc,
    MeetingEntity,
} from 'src/modules/meeting/repository/entities/meeting.entity';
import { MeetingRepository } from 'src/modules/meeting/repository/repositories/meeting.repository';

@Injectable()
export class MeetingService implements IMeetingService {
    private readonly client: StreamClient;

    constructor(
        private readonly meetingRepository: MeetingRepository,
        private readonly configService: ConfigService,
        private readonly helperURLService: HelperURLService
    ) {
        const apiKey = this.configService.get<string>('stream.apiKey');
        const secret = this.configService.get<string>('stream.secretKey');
        const timeout = this.configService.get<number>('stream.timeout');

        this.client = new StreamClient(apiKey, secret, { timeout });
    }

    async findAll(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<MeetingDoc[]> {
        return this.meetingRepository.findAll(find, options);
    }

    async findOne(
        find: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<MeetingDoc> {
        return this.meetingRepository.findOne(find, options);
    }

    async checkMeetingAlreadyExists(
        event: string,
        owner: string,
        options?: IDatabaseOptions
    ): Promise<MeetingDoc> {
        console.log('Event is: ' + event);
        const find: any = DatabaseQueryAnd([{ title: event }, { owner }]);
        console.log('Find is: ' + JSON.stringify(find, null, 2));
        return this.meetingRepository.findOne(find, options);
    }

    async cancelMeeting(
        repository: MeetingDoc,
        { status, cancellationReason }: CancelMeetingRequestDto,
        options?: IDatabaseSaveOptions
    ): Promise<MeetingDoc> {
        repository.status = status;
        repository.cancellationReason = cancellationReason;

        return this.meetingRepository.save(repository, options);
    }

    async findOneById(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<MeetingDoc> {
        console.log(JSON.stringify(options, null, 2));
        return this.meetingRepository.findOneById(_id, options);
    }

    async findOneActiveById(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<MeetingDoc> {
        return this.meetingRepository.findOne({ _id, isActive: true }, options);
    }

    async getTotal(
        find?: Record<string, any>,
        options?: IDatabaseGetTotalOptions
    ): Promise<number> {
        return this.meetingRepository.getTotal(find, options);
    }

    async deleteMany(
        find: Record<string, any>,
        options?: IDatabaseDeleteManyOptions
    ): Promise<boolean> {
        try {
            await this.meetingRepository.deleteMany(find, options);

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
        }: Partial<MeetingCreateRequestDto>,
        userId: string,
        options?: IDatabaseCreateOptions
    ): Promise<MeetingDoc> {
        const create: MeetingEntity = new MeetingEntity();
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

        return this.meetingRepository.create<MeetingEntity>(create, options);
    }

    async mapList(
        categories: MeetingDoc[] | MeetingEntity[]
    ): Promise<MeetingListResponseDto[]> {
        return plainToInstance(
            MeetingListResponseDto,
            categories.map((e: MeetingDoc | MeetingEntity) =>
                e instanceof Document ? e.toObject() : e
            )
        );
    }

    async mapGet(
        event: MeetingDoc | MeetingEntity
    ): Promise<MeetingGetResponseDto> {
        return plainToInstance(
            MeetingGetResponseDto,
            event instanceof Document ? event.toObject() : event
        );
    }

    async mapGetShort(
        booking: MeetingDoc | MeetingEntity
    ): Promise<MeetingShortResponseDto> {
        return plainToInstance(
            MeetingShortResponseDto,
            booking instanceof Document ? booking.toObject() : booking
        );
    }

    async mapShort(
        bookings: MeetingDoc[] | MeetingEntity[]
    ): Promise<MeetingShortResponseDto[]> {
        return plainToInstance(
            MeetingShortResponseDto,
            bookings.map((booking: MeetingDoc | MeetingEntity) =>
                booking instanceof Document ? booking.toObject() : booking
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

    // region New Methods
    /**
     * Creates a new user in the GetStream system.
     * @param userId - The unique ID of the user.
     * @param role - Role of the user (e.g., 'user', 'admin').
     * @param name - User's name.
     * @param image - URL to the user's profile image.
     * @param custom - Additional custom data.
     */
    async createUser(
        userId: string,
        role: string,
        name: string,
        image: string,
        custom: Record<string, any>
    ) {
        const newUser = {
            id: userId,
            role,
            name,
            image,
            custom,
        };
        return this.client.upsertUsers([newUser]);
    }

    /**
     * Generates a token for a specific user.
     * @param userId - The ID of the user.
     * @param validityInSeconds - Token validity duration in seconds.
     */
    async generateUserToken(userId: string, validityInSeconds: number = 3600) {
        return this.client.generateUserToken({
            user_id: userId,
            validity_in_seconds: validityInSeconds,
        });
    }

    /**
     * Creates a video call with specified members and custom data.
     * @param callType - The type of the call (e.g., 'default').
     * @param callId - A unique ID for the call.
     * @param createdBy - The ID of the user creating the call.
     * @param members - Array of members (user IDs and roles) participating in the call.
     * @param customData - Additional custom data for the call.
     */
    async createCall(
        callType: string,
        callId: string,
        createdBy: string,
        members: Array<{ user_id: string; role?: string }>,
        customData: Record<string, any>
    ) {
        const call = this.client.video.call(callType, callId);
        return call.create({
            data: {
                created_by_id: createdBy,
                members,
                custom: customData,
            },
        });
    }

    /**
     * Retrieves or creates a video call.
     * @param callType - The type of the call.
     * @param callId - The ID of the call.
     * @param data - Data used to create or retrieve the call.
     */
    async getOrCreateCall(
        callType: string,
        callId: string,
        data: Record<string, any>
    ) {
        const call = this.client.video.call(callType, callId);
        return call.getOrCreate({ data });
    }

    // region Get Rate Limit
    async getServerSideRateLimit(): Promise<
        StreamResponse<GetRateLimitsResponse>
    > {
        // 1. Get Rate limits, server-side platform
        return await this.client.getRateLimits({ server_side: true });
    }
    // endregion
    // endregion
}
