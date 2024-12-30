import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    CallRequest,
    DeleteUsersRequest,
    StreamClient,
    UserRequest,
} from '@stream-io/node-sdk';
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
import { MeetingCreateRequestDto } from 'src/modules/meeting/dtos/request/meeting.create.request.dto';
import {
    MeetingGetResponseDto,
    MeetingListResponseDto,
    MeetingShortResponseDto,
} from 'src/modules/meeting/dtos/response/meeting.get.response.dto';
import {
    ENUM_MEETING_CALL_TYPE,
    ENUM_MEETING_USER_TYPE,
} from 'src/modules/meeting/enums/meeting.enum';
import { IMeetingService } from 'src/modules/meeting/interfaces/meeting.service.interface';
import {
    CallType,
    MeetingDoc,
    MeetingEntity,
} from 'src/modules/meeting/repository/entities/meeting.entity';
import { MeetingRepository } from 'src/modules/meeting/repository/repositories/meeting.repository';
import { IUserDoc } from 'src/modules/user/interfaces/user.interface';
import { UserService } from 'src/modules/user/services/user.service';

@Injectable()
export class MeetingService implements IMeetingService {
    private readonly client: StreamClient;

    constructor(
        private readonly meetingRepository: MeetingRepository,
        private readonly configService: ConfigService,
        private readonly userService: UserService,
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
        { meetingId, type, createdBy }: Partial<MeetingCreateRequestDto>,
        options?: IDatabaseCreateOptions
    ): Promise<MeetingDoc> {
        const create: MeetingEntity = new MeetingEntity();
        create.meetingId = meetingId;
        create.type = type;
        create.createdBy = createdBy;
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

    // region Create New User
    async createUser(newUser: UserRequest) {
        return await this.client.upsertUsers([newUser]);
    }
    // endregion

    // region Create Stream Account If Needed
    async createStreamAccountIfNeeded(
        user: IUserDoc,
        options: IDatabaseSaveOptions
    ): Promise<void> {
        if (!user.streamUserCreated) {
            console.log('User already have a Stream Account');
            console.log('Creating a New Account...');
            const meetingUser = await this.createUser({
                id: user._id,
                role: ENUM_MEETING_USER_TYPE.USER,
            });

            if (!meetingUser?.users?.[user._id]) {
                throw new InternalServerErrorException(
                    'user.error.unableToCreateStreamUser'
                );
            }

            const userDoc = await this.userService.findOneById(user._id, {
                session: options.session,
            });

            await this.userService.updateStreamUserCreatedStatus(
                userDoc,
                true,
                options
            );
        } else {
            console.log('User already have a Stream Account.');
        }
    }
    // endregion

    // region Generate JWT Token for User
    async generateUserToken(userId: string, validityInSeconds: number = 3600) {
        return this.client.generateUserToken({
            user_id: userId,
            validity_in_seconds: validityInSeconds,
        });
    }
    // endregion

    // region Create Call
    async createCall(
        callType: CallType,
        callId: string,
        callData: CallRequest
    ) {
        try {
            const call = this.client.video.call(callType, callId);

            return call.getOrCreate({
                data: callData,
            });
        } catch (err) {
            console.log(JSON.stringify(err));
        }
    }
    // endregion

    // region Create Default Call
    async createDefaultCall(
        meetingId: string,
        roomOwnerId: string,
        guestId: string,
        startDate: Date,
        duration: number,
        description?: string
    ) {
        const callData: CallRequest = {
            created_by: { id: roomOwnerId },
            members: [
                {
                    user_id: roomOwnerId,
                    role: ENUM_MEETING_USER_TYPE.USER,
                },
                {
                    user_id: guestId,
                    role: ENUM_MEETING_USER_TYPE.CALL_MEMBER,
                },
            ],
            starts_at: startDate,
            settings_override: {
                limits: {
                    max_duration_seconds: duration * 60,
                },
            },
        };

        if (description) {
            callData.custom = { description };
        }

        return await this.createCall(
            ENUM_MEETING_CALL_TYPE.DEFAULT,
            meetingId,
            callData
        );
    }
    // endregion

    // region Retrieve or Create a Video Call
    async getOrCreateCall(
        callType: string,
        callId: string,
        data: Record<string, any>
    ) {
        const call = this.client.video.call(callType, callId);
        return call.getOrCreate({ data });
    }
    // endregion

    // region Get Rate Limit
    async getServerSideRateLimit() {
        return await this.client.getRateLimits({ server_side: true });
    }
    // endregion

    // region Delete Users
    async deleteUsers(deleteUserRequest: DeleteUsersRequest) {
        return await this.client.deleteUsers(deleteUserRequest);
    }
    // endregion

    // region Delete Call
    async deleteCall(callId: string) {
        const callType = 'default';
        const call = this.client.video.call(callType, callId);

        return await call.delete({ hard: true });
    }
    // endregion

    // region Get Async Task Status
    async getAsyncTaskStats(taskId: string) {
        return await this.client.getTask({ id: taskId });
    }
    // endregion

    // region Get Meeting User Info By Id
    async getMeetingUserInfo(userId: string) {
        return await this.client.queryUsers({
            payload: {
                filter_conditions: {
                    id: userId,
                },
            },
        });
    }
    // endregion

    // region Get Meeting Call Info By Id
    async getMeetingCallInfo(callId: string) {
        return await this.client.video.queryCalls({
            filter_conditions: {
                id: callId,
            },
        });
    }
    // endregion
}
