import { Controller, Get, Param, Query } from '@nestjs/common';
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
import { CATEGORY_DEFAULT_IS_ACTIVE } from 'src/modules/category/constants/category.list.constant';
import { EVENT_DEFAULT_AVAILABLE_SEARCH } from 'src/modules/events/constants/event.list.constant';
import { EventShortResponseDto } from 'src/modules/events/dtos/response/event.get.response.dto';
import { EventParsePipe } from 'src/modules/events/pipes/event.parse.pipe';
import { EventDoc } from 'src/modules/events/repository/entities/event.entity';
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
import { UserParsePipe } from 'src/modules/user/pipes/user.parse.pipe';
import { UserDoc } from 'src/modules/user/repository/entities/user.entity';

@Controller({
    version: '1',
    path: '/events',
})
export class EventSharedController {
    constructor(
        private readonly eventService: EventService,
        private readonly paginationService: PaginationService
    ) {}

    // region Get Expert Events
    @ResponsePaging('event.list')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.EVENT,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(
        ENUM_POLICY_ROLE_TYPE.EXPERT,
        ENUM_POLICY_ROLE_TYPE.USER
    )
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Get('/user/:userId')
    async list(
        @Param('userId', RequestRequiredPipe, UserParsePipe)
        user: UserDoc,
        @PaginationQuery({
            availableSearch: EVENT_DEFAULT_AVAILABLE_SEARCH,
        })
        { _search, _limit, _offset, _order }: PaginationListDto,
        @PaginationQueryFilterInBoolean('isActive', CATEGORY_DEFAULT_IS_ACTIVE)
        isActive: Record<string, any>
    ): Promise<IResponsePaging<EventShortResponseDto>> {
        const find: Record<string, any> = {
            ..._search,
            ...isActive,
            owner: user._id,
        };

        const events: EventDoc[] = await this.eventService.findAll(find, {
            paging: {
                limit: _limit,
                offset: _offset,
            },
            order: _order,
        });

        const total: number = await this.eventService.getTotal(find);
        const totalPage: number = this.paginationService.totalPage(
            total,
            _limit
        );

        const mapped: EventShortResponseDto[] =
            await this.eventService.mapShort(events);

        return {
            _pagination: { total, totalPage },
            data: mapped,
        };
    }

    // endregion

    // region Get Event Details By Slug
    @Response('event.get')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.EVENT,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(
        ENUM_POLICY_ROLE_TYPE.EXPERT,
        ENUM_POLICY_ROLE_TYPE.USER
    )
    @AuthJwtAccessProtected()
    @Get('/user/:userId/:event')
    async get(
        @Param('userId', RequestRequiredPipe, UserParsePipe)
        user: UserDoc,
        @Param('event', RequestRequiredPipe, EventParsePipe)
        event: EventDoc
    ): Promise<IResponse<EventShortResponseDto>> {
        const mapped: EventShortResponseDto =
            await this.eventService.mapGetShort(event);
        return { data: mapped };
    }

    // endregion

    // region Get Event Available Slots
    @ResponsePaging('event.list')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.SLOT,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(
        ENUM_POLICY_ROLE_TYPE.EXPERT,
        ENUM_POLICY_ROLE_TYPE.USER
    )
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Get('/:eventId/slots')
    async getSlots(
        @Param('eventId') eventId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string
    ) {
        console.log('*****************************');
        console.log('Start Date: ' + startDate);
        console.log('End Date: ' + startDate);
        console.log();
        const slots = await this.eventService.getAvailableSlots(eventId, {
            start: new Date(startDate),
            end: new Date(endDate),
        });
        return { slots };
    }

    // endregion
}
