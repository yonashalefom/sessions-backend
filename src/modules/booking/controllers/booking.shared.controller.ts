import {
    Controller,
    Get,
    NotFoundException,
    Param,
    Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import moment from 'moment-timezone';
import {
    PaginationQuery,
    PaginationQueryFilterInBoolean,
} from 'src/common/pagination/decorators/pagination.decorator';
import { PaginationListDto } from 'src/common/pagination/dtos/pagination.list.dto';
import { PaginationService } from 'src/common/pagination/services/pagination.service';
import { RequestRequiredPipe } from 'src/common/request/pipes/request.required.pipe';
import {
    ResponsePaging,
    Response,
} from 'src/common/response/decorators/response.decorator';
import {
    IResponse,
    IResponsePaging,
} from 'src/common/response/interfaces/response.interface';
import { ApiKeyProtected } from 'src/modules/api-key/decorators/api-key.decorator';
import {
    AuthJwtAccessProtected,
    AuthJwtPayload,
} from 'src/modules/auth/decorators/auth.jwt.decorator';
import { AuthJwtAccessPayloadDto } from 'src/modules/auth/dtos/jwt/auth.jwt.access-payload.dto';
import {
    BOOKING_DEFAULT_AVAILABLE_SEARCH,
    BOOKING_DEFAULT_IS_ACTIVE,
} from 'src/modules/booking/constants/booking.list.constant';
import { BookingShortResponseDto } from 'src/modules/booking/dtos/response/booking.get.response.dto';
import { ENUM_BOOKING_STATUS_CODE_ERROR } from 'src/modules/booking/enums/booking.status-code.enum';
import { BookingParsePipe } from 'src/modules/booking/pipes/booking.parse.pipe';
import { BookingDoc } from 'src/modules/booking/repository/entities/booking.entity';
import { BookingService } from 'src/modules/booking/services/booking.service';
import { EventService } from 'src/modules/events/services/event.service';
import {
    PolicyAbilityProtected,
    PolicyRoleProtected,
} from 'src/modules/policy/decorators/policy.decorator';
import {
    ENUM_POLICY_ACTION,
    ENUM_POLICY_ROLE_TYPE,
    ENUM_POLICY_SUBJECT,
} from 'src/modules/policy/enums/policy.enum';
import { UserGetResponseDto } from 'src/modules/user/dtos/response/user.get.response.dto';
import { IUserDoc } from 'src/modules/user/interfaces/user.interface';
import { UserActiveParsePipe } from 'src/modules/user/pipes/user.parse.pipe';

@ApiTags('modules.user.booking')
@Controller({
    version: '1',
    path: '/booking',
})
export class BookingSharedController {
    constructor(
        private readonly bookingService: BookingService,
        private readonly eventService: EventService,
        private readonly paginationService: PaginationService
    ) {}

    // region Get User Bookings
    @ResponsePaging('booking.list')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.BOOKING,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(
        ENUM_POLICY_ROLE_TYPE.EXPERT,
        ENUM_POLICY_ROLE_TYPE.USER
    )
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
        @Query('active') active: string
    ): Promise<IResponsePaging<BookingShortResponseDto>> {
        const find: Record<string, any> = {
            ..._search,
            ...isActive,
            ...(user.role.type === ENUM_POLICY_ROLE_TYPE.EXPERT
                ? { expertId: user._id }
                : { userId: user._id }),
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
        const isBookingOwner =
            (user.role.type === ENUM_POLICY_ROLE_TYPE.EXPERT &&
                (booking.expertId as unknown as UserGetResponseDto)._id ===
                    user._id) ||
            (user.role.type === ENUM_POLICY_ROLE_TYPE.USER &&
                (booking.userId as unknown as UserGetResponseDto)._id ===
                    user._id);

        if (!isBookingOwner) {
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
