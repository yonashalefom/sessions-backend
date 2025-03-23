import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestRequiredPipe } from 'src/common/request/pipes/request.required.pipe';
import { Response } from 'src/common/response/decorators/response.decorator';
import { IResponse } from 'src/common/response/interfaces/response.interface';
import { ApiKeyProtected } from 'src/modules/api-key/decorators/api-key.decorator';
import {
    AuthJwtAccessProtected,
    AuthJwtPayload,
} from 'src/modules/auth/decorators/auth.jwt.decorator';
import { AuthJwtAccessPayloadDto } from 'src/modules/auth/dtos/jwt/auth.jwt.access-payload.dto';
import { EventParsePipe } from 'src/modules/events/pipes/event.parse.pipe';
import { EventDoc } from 'src/modules/events/repository/entities/event.entity';
import {
    PolicyAbilityProtected,
    PolicyRoleProtected,
} from 'src/modules/policy/decorators/policy.decorator';
import {
    ENUM_POLICY_ACTION,
    ENUM_POLICY_ROLE_TYPE,
    ENUM_POLICY_SUBJECT,
} from 'src/modules/policy/enums/policy.enum';
import { ScheduleService } from 'src/modules/schedules/services/schedule.service';
import { SlotDto } from 'src/modules/slot/dtos/response/slot.get.response.dto';
import { DateParsePipe } from 'src/modules/slot/pipes/date.parse.pipe';
import { SlotService } from 'src/modules/slot/services/slot.service';
import { DateRangeWithTimezone } from 'src/modules/slot/types/types';
import { IUserDoc } from 'src/modules/user/interfaces/user.interface';
import { UserActiveParsePipe } from 'src/modules/user/pipes/user.parse.pipe';
import { UserProtected } from 'src/modules/user/decorators/user.decorator';

@ApiTags('modules.shared.slots')
@Controller({
    version: '1',
    path: '/slots',
})
export class SlotUserController {
    constructor(
        private readonly scheduleService: ScheduleService,
        private readonly slotService: SlotService
    ) {}

    // region Get Available Slots for Event
    @Response('slot.getAvailable')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.SLOT,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.USER)
    @UserProtected()
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Get('/available')
    async getAvailableSlots(
        @Query('eventId', RequestRequiredPipe, EventParsePipe)
        expertEvent: EventDoc,
        @Query('startDate', RequestRequiredPipe, DateParsePipe)
        start: Date,
        @Query('endDate', RequestRequiredPipe, DateParsePipe)
        end: Date,
        @AuthJwtPayload<AuthJwtAccessPayloadDto>('_id', UserActiveParsePipe)
        user: IUserDoc
    ): Promise<IResponse<Record<string, SlotDto[]>>> {
        const userTimezone = user.country.timeZone;

        const { startDate, endDate } = this.slotService.validateDateRange(
            userTimezone,
            start,
            end
        );

        const dateRange: DateRangeWithTimezone = {
            start: startDate,
            end: endDate,
            userTimezone,
        };

        const availableSlots = await this.slotService.getAvailableSlots(
            expertEvent,
            dateRange
        );

        return { data: availableSlots };
    }
    // endregion
}
