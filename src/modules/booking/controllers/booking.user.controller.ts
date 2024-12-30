import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    InternalServerErrorException,
    Param,
    Post,
} from '@nestjs/common';
import { ENUM_BOOKING_REF_TYPE } from 'src/modules/booking/enums/booking.enum';
import { IEventDoc } from 'src/modules/events/interfaces/event.interface';
import { EventParsePipe } from 'src/modules/events/pipes/event.parse.pipe';
import { EventDoc } from 'src/modules/events/repository/entities/event.entity';
import { ENUM_MEETING_CALL_TYPE } from 'src/modules/meeting/enums/meeting.enum';
import { UserService } from 'src/modules/user/services/user.service';
import { v4 as uuidV4 } from 'uuid';
import { ApiTags } from '@nestjs/swagger';
import { ClientSession, Connection } from 'mongoose';
import { ENUM_APP_STATUS_CODE_ERROR } from 'src/app/enums/app.status-code.enum';
import { DatabaseConnection } from 'src/common/database/decorators/database.decorator';
import { DatabaseIdResponseDto } from 'src/common/database/dtos/response/database.id.response.dto';
import { HelperDateService } from 'src/common/helper/services/helper.date.service';
import { RequestRequiredPipe } from 'src/common/request/pipes/request.required.pipe';
import { ApiKeyProtected } from 'src/modules/api-key/decorators/api-key.decorator';
import {
    AuthJwtAccessProtected,
    AuthJwtPayload,
} from 'src/modules/auth/decorators/auth.jwt.decorator';
import { PaginationService } from 'src/common/pagination/services/pagination.service';
import { AuthJwtAccessPayloadDto } from 'src/modules/auth/dtos/jwt/auth.jwt.access-payload.dto';
import { CreateBookingValidation } from 'src/modules/booking/decorators/booking.common.decorator';
import { BookingCreateRequestDto } from 'src/modules/booking/dtos/request/booking.create.request.dto';
import { ENUM_BOOKING_STATUS_CODE_ERROR } from 'src/modules/booking/enums/booking.status-code.enum';
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
import { Response } from 'src/common/response/decorators/response.decorator';
import { IResponse } from 'src/common/response/interfaces/response.interface';
import { ScheduleService } from 'src/modules/schedules/services/schedule.service';
import { SlotService } from 'src/modules/slot/services/slot.service';
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

        console.log('Trying to Book Slot: ');
        console.log('startDate: ', startDate);
        console.log('endDate: ', endDate);

        // region Check if the Provided Date Range is a Valid and Bookable Slot
        const isValidSlot = await this.bookingService.checkIfSlotIsBookableSlot(
            eventDoc as unknown as EventDoc,
            startDate,
            endDate,
            user.country.timeZone
        );

        if (!isValidSlot) {
            throw new BadRequestException({
                statusCode: ENUM_BOOKING_STATUS_CODE_ERROR.INVALID_SLOT,
                message: 'booking.error.invalidSlot',
            });
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

            const meetingCall = await this.meetingService.createDefaultCall(
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
}
