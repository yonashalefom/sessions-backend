import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationService } from 'src/common/pagination/services/pagination.service';
import { RequestRequiredPipe } from 'src/common/request/pipes/request.required.pipe';
import { Response } from 'src/common/response/decorators/response.decorator';
import { IResponse } from 'src/common/response/interfaces/response.interface';
import { ApiKeyProtected } from 'src/modules/api-key/decorators/api-key.decorator';
import {
    AuthJwtAccessProtected,
    AuthJwtPayload,
} from 'src/modules/auth/decorators/auth.jwt.decorator';
import { AuthJwtAccessPayloadDto } from 'src/modules/auth/dtos/jwt/auth.jwt.access-payload.dto';
import { CancelBookingValidation } from 'src/modules/booking/decorators/booking.common.decorator';
import { CancelBookingRequestDto } from 'src/modules/booking/dtos/request/booking.create.request.dto';
import { BookingShortResponseDto } from 'src/modules/booking/dtos/response/booking.get.response.dto';
import { ENUM_BOOKING_STATUS_TYPE } from 'src/modules/booking/enums/booking.enum';
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
import {
    UserActiveParsePipe,
    UserParsePipe,
} from 'src/modules/user/pipes/user.parse.pipe';
import { UserDoc } from 'src/modules/user/repository/entities/user.entity';

@ApiTags('modules.shared.event')
@Controller({
    version: '1',
    path: '/booking',
})
export class BookingExpertController {
    constructor(
        private readonly bookingService: BookingService,
        private readonly eventService: EventService,
        private readonly paginationService: PaginationService
    ) {}

    // region Get Booking Details By Id
    @Response('booking.get')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.BOOKING,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.EXPERT)
    @AuthJwtAccessProtected()
    @Get('/get/:bookingId')
    async get(
        @Param('bookingId', RequestRequiredPipe, BookingParsePipe)
        booking: BookingDoc,
        @AuthJwtPayload<AuthJwtAccessPayloadDto>('_id', UserActiveParsePipe)
        user: IUserDoc
    ): Promise<IResponse<BookingShortResponseDto>> {
        if (
            (booking.expertId as unknown as UserGetResponseDto)._id !== user._id
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

    // region Cancel Booking
    @Response('booking.cancelBooking')
    @CancelBookingValidation()
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Put('/cancel/:bookingId')
    async updateProfile(
        @AuthJwtPayload<AuthJwtAccessPayloadDto>('_id', UserParsePipe)
        user: UserDoc,
        @Param('bookingId', RequestRequiredPipe, BookingParsePipe)
        booking: BookingDoc,
        @Body()
        body: CancelBookingRequestDto
    ): Promise<void> {
        if (
            (booking.expertId as unknown as UserGetResponseDto)._id !== user._id
        ) {
            throw new NotFoundException({
                statusCode: ENUM_BOOKING_STATUS_CODE_ERROR.NOT_FOUND,
                message: 'booking.error.notFound',
            });
        }

        await this.bookingService.cancelBooking(booking, {
            status: ENUM_BOOKING_STATUS_TYPE.CANCELLED,
            ...body,
        });

        return;
    }
    // endregion
}
