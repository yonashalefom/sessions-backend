import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    PaginationQuery,
    PaginationQueryFilterInBoolean,
} from 'src/common/pagination/decorators/pagination.decorator';
import { PaginationListDto } from 'src/common/pagination/dtos/pagination.list.dto';
import { PaginationService } from 'src/common/pagination/services/pagination.service';
import { RequestRequiredPipe } from 'src/common/request/pipes/request.required.pipe';
import {
    Response,
    ResponsePaging,
} from 'src/common/response/decorators/response.decorator';
import {
    IResponse,
    IResponsePaging,
} from 'src/common/response/interfaces/response.interface';
import { ApiKeyProtected } from 'src/modules/api-key/decorators/api-key.decorator';
import { AuthJwtAccessProtected } from 'src/modules/auth/decorators/auth.jwt.decorator';
import {
    PolicyAbilityProtected,
    PolicyRoleProtected,
} from 'src/modules/policy/decorators/policy.decorator';
import {
    ENUM_POLICY_ACTION,
    ENUM_POLICY_ROLE_TYPE,
    ENUM_POLICY_SUBJECT,
} from 'src/modules/policy/enums/policy.enum';
import {
    SCHEDULE_DEFAULT_AVAILABLE_SEARCH,
    SCHEDULE_DEFAULT_IS_ACTIVE,
} from 'src/modules/schedules/constants/schedule.constants';
import { ScheduleShortResponseDto } from 'src/modules/schedules/dtos/response/schedule.get.response.dto';
import { ScheduleParsePipe } from 'src/modules/schedules/pipes/schedule.parse.pipe';
import { ScheduleDoc } from 'src/modules/schedules/repository/entities/schedule.entity';
import { ScheduleService } from 'src/modules/schedules/services/schedule.service';
import { UserParsePipe } from 'src/modules/user/pipes/user.parse.pipe';
import { UserDoc } from 'src/modules/user/repository/entities/user.entity';

@ApiTags('modules.shared.event')
@Controller({
    version: '1',
    path: '/schedule',
})
export class ScheduleSharedController {
    constructor(
        private readonly scheduleService: ScheduleService,
        private readonly paginationService: PaginationService
    ) {}

    // region Get Expert Schedules
    @ResponsePaging('schedule.list')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.SCHEDULE,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(
        ENUM_POLICY_ROLE_TYPE.EXPERT,
        ENUM_POLICY_ROLE_TYPE.USER
    )
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Get('get/by-user/:userId')
    async list(
        @Param('userId', RequestRequiredPipe, UserParsePipe)
        user: UserDoc,
        @PaginationQuery({
            availableSearch: SCHEDULE_DEFAULT_AVAILABLE_SEARCH,
        })
        { _search, _limit, _offset, _order }: PaginationListDto,
        @PaginationQueryFilterInBoolean('isActive', SCHEDULE_DEFAULT_IS_ACTIVE)
        isActive: Record<string, any>
    ): Promise<IResponsePaging<ScheduleShortResponseDto>> {
        const find: Record<string, any> = {
            ..._search,
            ...isActive,
            userId: user._id,
        };

        const events: ScheduleDoc[] = await this.scheduleService.findAll(find, {
            paging: {
                limit: _limit,
                offset: _offset,
            },
            order: _order,
        });

        const total: number = await this.scheduleService.getTotal(find);
        const totalPage: number = this.paginationService.totalPage(
            total,
            _limit
        );

        const mapped: ScheduleShortResponseDto[] =
            await this.scheduleService.mapShort(events);

        return {
            _pagination: { total, totalPage },
            data: mapped,
        };
    }

    // endregion

    // region Get Schedule Details By Id
    @Response('schedule.get')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.SCHEDULE,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(
        ENUM_POLICY_ROLE_TYPE.EXPERT,
        ENUM_POLICY_ROLE_TYPE.USER
    )
    @AuthJwtAccessProtected()
    @Get('/get/:scheduleId')
    async get(
        @Param('scheduleId', RequestRequiredPipe, ScheduleParsePipe)
        schedule: ScheduleDoc
    ): Promise<IResponse<ScheduleShortResponseDto>> {
        const mapped: ScheduleShortResponseDto =
            await this.scheduleService.mapGetShort(schedule);
        return { data: mapped };
    }
    // endregion
}
