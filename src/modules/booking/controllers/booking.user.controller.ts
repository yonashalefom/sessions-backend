import {
    BadRequestException,
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
export class BookingUserController {
    constructor(
        @DatabaseConnection() private readonly databaseConnection: Connection,
        private readonly bookingService: BookingService,
        private readonly eventService: EventService,
        private readonly slotService: SlotService,
        private readonly scheduleService: ScheduleService,
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
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.EXPERT)
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Post('/create')
    async createBooking(
        @AuthJwtPayload<AuthJwtAccessPayloadDto>('_id', UserActiveParsePipe)
        user: IUserDoc,
        @Body()
        body: BookingCreateRequestDto
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
            const booking = await this.bookingService.create(
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
        isActive: Record<string, any>
    ): Promise<IResponsePaging<BookingShortResponseDto>> {
        const find: Record<string, any> = {
            ..._search,
            ...isActive,
            userId: user._id,
        };

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
