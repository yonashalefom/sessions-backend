import {
    Body,
    Controller,
    NotFoundException,
    Param,
    Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestRequiredPipe } from 'src/common/request/pipes/request.required.pipe';
import { Response } from 'src/common/response/decorators/response.decorator';
import { ApiKeyProtected } from 'src/modules/api-key/decorators/api-key.decorator';
import {
    AuthJwtAccessProtected,
    AuthJwtPayload,
} from 'src/modules/auth/decorators/auth.jwt.decorator';
import { AuthJwtAccessPayloadDto } from 'src/modules/auth/dtos/jwt/auth.jwt.access-payload.dto';
import { CancelBookingValidation } from 'src/modules/booking/decorators/booking.common.decorator';
import { CancelBookingRequestDto } from 'src/modules/booking/dtos/request/booking.create.request.dto';
import { ENUM_BOOKING_STATUS_TYPE } from 'src/modules/booking/enums/booking.enum';
import { ENUM_BOOKING_STATUS_CODE_ERROR } from 'src/modules/booking/enums/booking.status-code.enum';
import { BookingParsePipe } from 'src/modules/booking/pipes/booking.parse.pipe';
import { BookingDoc } from 'src/modules/booking/repository/entities/booking.entity';
import { BookingService } from 'src/modules/booking/services/booking.service';
import { UserGetResponseDto } from 'src/modules/user/dtos/response/user.get.response.dto';
import { UserParsePipe } from 'src/modules/user/pipes/user.parse.pipe';
import { UserDoc } from 'src/modules/user/repository/entities/user.entity';

@ApiTags('modules.expert.booking')
@Controller({
    version: '1',
    path: '/booking',
})
export class BookingExpertController {
    constructor(private readonly bookingService: BookingService) {}

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
