import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Post,
    Query,
} from '@nestjs/common';
import { ENUM_BOOKING_REF_TYPE } from 'src/modules/booking/enums/booking.enum';
import { IEventDoc } from 'src/modules/booking/interfaces/booking.interface';
import { EventParsePipe } from 'src/modules/events/pipes/event.parse.pipe';
import { EventDoc } from 'src/modules/events/repository/entities/event.entity';
import { ENUM_MEETING_CALL_TYPE } from 'src/modules/meeting/enums/meeting.enum';
import { UserService } from 'src/modules/user/services/user.service';
import { v4 as uuidV4 } from 'uuid';
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
import {
    BOOKING_DEFAULT_AVAILABLE_SEARCH,
    BOOKING_DEFAULT_IS_ACTIVE,
} from 'src/modules/booking/constants/booking.list.constant';
import { CreateBookingValidation } from 'src/modules/booking/decorators/booking.common.decorator';
import { BookingCreateRequestDto } from 'src/modules/booking/dtos/request/booking.create.request.dto';
import { BookingShortResponseDto } from 'src/modules/booking/dtos/response/booking.get.response.dto';
import { ENUM_BOOKING_STATUS_CODE_ERROR } from 'src/modules/booking/enums/booking.status-code.enum';
import { BookingParsePipe } from 'src/modules/booking/pipes/booking.parse.pipe';
import { BookingDoc } from 'src/modules/booking/repository/entities/booking.entity';
import { BookingService } from 'src/modules/booking/services/booking.service';
import { EventService } from 'src/modules/events/services/event.service';
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
export class BookingUserController {
    constructor(
        @DatabaseConnection() private readonly databaseConnection: Connection,
        private readonly bookingService: BookingService,
        private readonly userService: UserService,
        private readonly eventService: EventService,
        private readonly slotService: SlotService,
        private readonly scheduleService: ScheduleService,
        private readonly meetingService: MeetingService,
        private readonly helperDateService: HelperDateService,
        private readonly paginationService: PaginationService
    ) {}

    // region Create New Booking
    @Response('booking.create')
    @CreateBookingValidation()
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.BOOKING,
        action: [ENUM_POLICY_ACTION.CREATE],
    })
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.USER)
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Post('/book/:event')
    async createBooking(
        @Param('event', RequestRequiredPipe, EventParsePipe)
        eventDoc: IEventDoc,
        @AuthJwtPayload<AuthJwtAccessPayloadDto>('_id', UserActiveParsePipe)
        user: IUserDoc,
        @Body()
        body: BookingCreateRequestDto
    ): Promise<IResponse<DatabaseIdResponseDto>> {
        const { startTime } = body;

        if (user._id === eventDoc.owner._id) {
            throw new ForbiddenException({
                statusCode: ENUM_BOOKING_STATUS_CODE_ERROR.FORBIDDEN,
                message: 'booking.error.ownBookingForbidden',
            });
        }

        // region Check if the Provided Date is Valid and Greater Than Today
        const { startDate, endDate } =
            this.bookingService.validateAndGenerateDateRange(
                startTime,
                eventDoc.duration,
                user.country.timeZone
            );
        // endregion

        // region Check if the Provided Date Range is a Valid and Bookable Slot
        const isValidSlot = await this.bookingService.checkIfSlotIsBookableSlot(
            eventDoc as unknown as EventDoc,
            startDate,
            endDate,
            user.country.timeZone
        );

        if (!isValidSlot) {
            throw new BadRequestException(
                'The requested time is not a valid slot.'
            );
        }
        // endregion

        const session: ClientSession =
            await this.databaseConnection.startSession();
        session.startTransaction();

        try {
            // region Schedule a Video Call Meeting
            const meetingId = uuidV4();

            await this.meetingService.createStreamAccountIfNeeded(
                eventDoc.owner as unknown as IUserDoc,
                {
                    session,
                }
            );

            await this.meetingService.createStreamAccountIfNeeded(user, {
                session,
            });

            const meetingCall = this.meetingService.createDefaultCall(
                meetingId,
                eventDoc.owner._id,
                user._id,
                startDate,
                eventDoc.duration,
                body.description
            );

            console.log('Call Info: ' + JSON.stringify(meetingCall, null, 2));

            await this.meetingService.create(
                {
                    meetingId,
                    type: ENUM_MEETING_CALL_TYPE.DEFAULT,
                    createdBy: eventDoc.owner._id,
                },
                {
                    session,
                }
            );
            // endregion;

            const booking = await this.bookingService.create(
                {
                    eventId: eventDoc._id,
                    expertId: eventDoc.owner._id,
                    startTime: startDate,
                    endTime: endDate,
                    description: body.description,
                    bookingRefType: ENUM_BOOKING_REF_TYPE.IN_APP_MEETING,
                },
                user._id,
                {
                    session,
                }
            );

            await session.commitTransaction();
            await session.endSession();

            return {
                data: { _id: booking._id },
            };
        } catch (err: any) {
            await session.abortTransaction();
            await session.endSession();

            throw new InternalServerErrorException({
                statusCode: ENUM_APP_STATUS_CODE_ERROR.UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }
    }

    // endregion

    // region Get All User Bookings
    @ResponsePaging('booking.list')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.BOOKING,
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
            availableSearch: BOOKING_DEFAULT_AVAILABLE_SEARCH,
        })
        { _search, _limit, _offset, _order }: PaginationListDto,
        @PaginationQueryFilterInBoolean('isActive', BOOKING_DEFAULT_IS_ACTIVE)
        isActive: Record<string, any>,
        @Query('active') active: string // Active filter query parameter
    ): Promise<IResponsePaging<BookingShortResponseDto>> {
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

        const bookings: BookingDoc[] = await this.bookingService.findAll(find, {
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

        const mapped: BookingShortResponseDto[] =
            await this.bookingService.mapShort(bookings);

        return {
            _pagination: { total, totalPage },
            data: mapped,
        };
    }

    // endregion

    // region Get Booking Details By Id
    @Response('booking.get')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.BOOKING,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(
        ENUM_POLICY_ROLE_TYPE.EXPERT,
        ENUM_POLICY_ROLE_TYPE.USER
    )
    @AuthJwtAccessProtected()
    @Get('/get/:bookingId')
    async get(
        @Param('bookingId', RequestRequiredPipe, BookingParsePipe)
        booking: BookingDoc,
        @AuthJwtPayload<AuthJwtAccessPayloadDto>('_id', UserActiveParsePipe)
        user: IUserDoc
    ): Promise<IResponse<BookingShortResponseDto>> {
        if (
            (booking.userId as unknown as UserGetResponseDto)._id !== user._id
        ) {
            throw new NotFoundException({
                statusCode: ENUM_BOOKING_STATUS_CODE_ERROR.NOT_FOUND,
                message: 'booking.error.notFound',
            });
        }

        const mapped: BookingShortResponseDto =
            await this.bookingService.mapGetShort(booking);
        return { data: mapped };
    }
    // endregion
}
