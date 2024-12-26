import {
    BadRequestException,
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Post,
    Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import moment from 'moment-timezone';
import { ClientSession, Connection } from 'mongoose';
import { ENUM_APP_STATUS_CODE_ERROR } from 'src/app/enums/app.status-code.enum';
import { DatabaseConnection } from 'src/common/database/decorators/database.decorator';
import { DatabaseIdResponseDto } from 'src/common/database/dtos/response/database.id.response.dto';
import { HelperDateService } from 'src/common/helper/services/helper.date.service';
import {
    PaginationQuery,
    PaginationQueryFilterInBoolean,
} from 'src/common/pagination/decorators/pagination.decorator';
import { PaginationListDto } from 'src/common/pagination/dtos/pagination.list.dto';
import { RequestRequiredPipe } from 'src/common/request/pipes/request.required.pipe';
import { ApiKeyProtected } from 'src/modules/api-key/decorators/api-key.decorator';
import {
    AuthJwtAccessProtected,
    AuthJwtPayload,
} from 'src/modules/auth/decorators/auth.jwt.decorator';
import { PaginationService } from 'src/common/pagination/services/pagination.service';
import { AuthJwtAccessPayloadDto } from 'src/modules/auth/dtos/jwt/auth.jwt.access-payload.dto';
import { EventService } from 'src/modules/events/services/event.service';
import {
    MEETING_DEFAULT_AVAILABLE_SEARCH,
    MEETING_DEFAULT_IS_ACTIVE,
} from 'src/modules/meeting/constants/meeting.list.constant';
import { CreateMeetingValidation } from 'src/modules/meeting/decorators/meeting.common.decorator';
import { MeetingCreateRequestDto } from 'src/modules/meeting/dtos/request/meeting.create.request.dto';
import { MeetingShortResponseDto } from 'src/modules/meeting/dtos/response/meeting.get.response.dto';
import { ENUM_MEETING_STATUS_CODE_ERROR } from 'src/modules/meeting/enums/meeting.status-code.enum';
import { MeetingParsePipe } from 'src/modules/meeting/pipes/meeting.parse.pipe';
import { MeetingDoc } from 'src/modules/meeting/repository/entities/meeting.entity';
import { MeetingService } from 'src/modules/meeting/services/meeting.service';
import {
    ENUM_POLICY_ACTION,
    ENUM_POLICY_ROLE_TYPE,
    ENUM_POLICY_SUBJECT,
} from 'src/modules/policy/enums/policy.enum';
import {
    PolicyAbilityProtected,
    PolicyRoleProtected,
} from 'src/modules/policy/decorators/policy.decorator';
import {
    Response,
    ResponsePaging,
} from 'src/common/response/decorators/response.decorator';
import {
    IResponse,
    IResponsePaging,
} from 'src/common/response/interfaces/response.interface';
import { ENUM_ROLE_STATUS_CODE_ERROR } from 'src/modules/role/enums/role.status-code.enum';
import { ScheduleService } from 'src/modules/schedules/services/schedule.service';
import { SlotService } from 'src/modules/slot/services/slot.service';
import { UserGetResponseDto } from 'src/modules/user/dtos/response/user.get.response.dto';
import { IUserDoc } from 'src/modules/user/interfaces/user.interface';
import { UserActiveParsePipe } from 'src/modules/user/pipes/user.parse.pipe';

@ApiTags('modules.admin.category')
@Controller({
    version: '1',
    path: '/booking',
})
export class MeetingUserController {
    constructor(
        @DatabaseConnection() private readonly databaseConnection: Connection,
        private readonly meetingService: MeetingService,
        private readonly eventService: EventService,
        private readonly slotService: SlotService,
        private readonly scheduleService: ScheduleService,
        private readonly helperDateService: HelperDateService,
        private readonly paginationService: PaginationService
    ) {}

    // region Create New Meeting
    @Response('meeting.create')
    @CreateMeetingValidation()
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.MEETING,
        action: [ENUM_POLICY_ACTION.CREATE],
    })
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.EXPERT)
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Post('/create')
    async createMeeting(
        @AuthJwtPayload<AuthJwtAccessPayloadDto>('_id', UserActiveParsePipe)
        user: IUserDoc,
        @Body()
        body: MeetingCreateRequestDto
    ): Promise<IResponse<DatabaseIdResponseDto>> {
        // ): Promise<{ data: { _id: string } }> {
        const { eventId, startTime } = body;

        // region Check Event Exists
        const eventDoc = await this.eventService.findOneById(eventId);

        if (!eventDoc) {
            throw new NotFoundException({
                statusCode: ENUM_ROLE_STATUS_CODE_ERROR.NOT_FOUND,
                message: 'event.error.notFound',
            });
        }
        // endregion

        // region Check if the Provided Date is Valid and Greater Than Today
        const startDate = this.helperDateService.create(
            startTime,
            undefined,
            user.country.timeZone
        );
        const endTime = this.helperDateService
            .forwardInMinutes(
                eventDoc.duration,
                { fromDate: startDate },
                user.country.timeZone
            )
            .toISOString();
        const endDate = this.helperDateService.create(
            endTime,
            undefined,
            user.country.timeZone
        );

        const today = this.helperDateService.create(
            undefined,
            {
                startOfDay: true,
            },
            user.country.timeZone
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
        // endregion

        const dateRange = {
            start: startDate,
            end: endDate,
            userTimezone: user.country.timeZone,
        };

        const availableSlots = await this.slotService.getAvailableSlots(
            eventDoc,
            dateRange
        );

        // Check if the requested time is valid
        const isValidSlot = this.slotService.isValidSlot(
            startDate.toISOString(),
            endDate.toISOString(),
            availableSlots
        );

        if (!isValidSlot) {
            throw new BadRequestException(
                'The requested time is not a valid slot.'
            );
        }

        const session: ClientSession =
            await this.databaseConnection.startSession();
        session.startTransaction();

        try {
            const booking = await this.meetingService.create(
                {
                    eventId,
                    expertId: eventDoc.owner,
                    startTime: startDate,
                    endTime: endDate,
                    description: body.description,
                },
                user._id,
                {
                    session,
                }
            );

            console.log('LLL: ' + JSON.stringify(booking, null, 2));

            await session.commitTransaction();
            await session.endSession();

            return {
                data: { _id: booking._id },
            };
        } catch (err: any) {
            await session.abortTransaction();
            await session.endSession();

            console.log(err.stacktrace);

            throw new InternalServerErrorException({
                statusCode: ENUM_APP_STATUS_CODE_ERROR.UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }
    }

    // endregion

    // region Get All User Meetings
    @ResponsePaging('meeting.list')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.MEETING,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.EXPERT)
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Get('/get/all')
    async list(
        @AuthJwtPayload<AuthJwtAccessPayloadDto>('_id', UserActiveParsePipe)
        user: IUserDoc,
        @PaginationQuery({
            availableSearch: MEETING_DEFAULT_AVAILABLE_SEARCH,
        })
        { _search, _limit, _offset, _order }: PaginationListDto,
        @PaginationQueryFilterInBoolean('isActive', MEETING_DEFAULT_IS_ACTIVE)
        isActive: Record<string, any>,
        @Query('active') active: string // Active filter query parameter
    ): Promise<IResponsePaging<MeetingShortResponseDto>> {
        const find: Record<string, any> = {
            ..._search,
            ...isActive,
            userId: user._id,
        };

        // Add active filter if the query parameter is provided
        if (active === 'true') {
            find.startTime = {
                $gte: moment().tz(user.country.timeZone).toDate(),
            };
        }

        const bookings: MeetingDoc[] = await this.meetingService.findAll(find, {
            paging: {
                limit: _limit,
                offset: _offset,
            },
            order: _order,
            join: true,
        });

        const total: number = await this.eventService.getTotal(find);
        const totalPage: number = this.paginationService.totalPage(
            total,
            _limit
        );

        const mapped: MeetingShortResponseDto[] =
            await this.meetingService.mapShort(bookings);

        return {
            _pagination: { total, totalPage },
            data: mapped,
        };
    }

    // endregion

    // region Get Meeting Details By Id
    @Response('meeting.get')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.MEETING,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(
        ENUM_POLICY_ROLE_TYPE.EXPERT,
        ENUM_POLICY_ROLE_TYPE.USER
    )
    @AuthJwtAccessProtected()
    @Get('/get/:meetingId')
    async get(
        @Param('meetingId', RequestRequiredPipe, MeetingParsePipe)
        booking: MeetingDoc,
        @AuthJwtPayload<AuthJwtAccessPayloadDto>('_id', UserActiveParsePipe)
        user: IUserDoc
    ): Promise<IResponse<MeetingShortResponseDto>> {
        if (
            (booking.userId as unknown as UserGetResponseDto)._id !== user._id
        ) {
            throw new NotFoundException({
                statusCode: ENUM_MEETING_STATUS_CODE_ERROR.NOT_FOUND,
                message: 'meeting.error.notFound',
            });
        }

        const mapped: MeetingShortResponseDto =
            await this.meetingService.mapGetShort(booking);
        return { data: mapped };
    }
    // endregion
}
