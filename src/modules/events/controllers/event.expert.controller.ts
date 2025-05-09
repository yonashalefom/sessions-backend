import {
    Body,
    ConflictException,
    Controller,
    InternalServerErrorException,
    Post,
} from '@nestjs/common';
import { ClientSession, Connection } from 'mongoose';
import { ENUM_APP_STATUS_CODE_ERROR } from 'src/app/enums/app.status-code.enum';
import { InjectDatabaseConnection } from 'src/common/database/decorators/database.decorator';
import { DatabaseIdResponseDto } from 'src/common/database/dtos/response/database.id.response.dto';
import { ApiKeyProtected } from 'src/modules/api-key/decorators/api-key.decorator';
import {
    AuthJwtAccessProtected,
    AuthJwtPayload,
} from 'src/modules/auth/decorators/auth.jwt.decorator';
import { PaginationService } from 'src/common/pagination/services/pagination.service';
import { CreateEventValidation } from 'src/modules/events/decorators/event.common.decorator';
import { EventCreateRequestDto } from 'src/modules/events/dtos/request/event.create.request.dto';
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
import { Response } from 'src/common/response/decorators/response.decorator';
import { IResponse } from 'src/common/response/interfaces/response.interface';
import { ENUM_USER_STATUS_CODE_ERROR } from 'src/modules/user/enums/user.status-code.enum';
import { UserParsePipe } from 'src/modules/user/pipes/user.parse.pipe';
import { UserDoc } from 'src/modules/user/repository/entities/user.entity';
import { UserProtected } from 'src/modules/user/decorators/user.decorator';

@Controller({
    version: '1',
    path: '/events',
})
export class EventExpertController {
    constructor(
        @InjectDatabaseConnection()
        private readonly databaseConnection: Connection,
        private readonly eventService: EventService,
        private readonly paginationService: PaginationService
    ) {}

    // region Create New Event
    @Response('event.create')
    @CreateEventValidation()
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.EVENT,
        action: [ENUM_POLICY_ACTION.CREATE],
    })
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.EXPERT)
    @UserProtected()
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Post('/create')
    async createEvent(
        @AuthJwtPayload('user', UserParsePipe) user: UserDoc,
        @Body()
        body: EventCreateRequestDto
    ): Promise<IResponse<DatabaseIdResponseDto>> {
        const { title } = body;
        const eventDoc = await this.eventService.checkEventAlreadyExists(
            title,
            user._id
        );

        if (eventDoc) {
            throw new ConflictException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.EMAIL_EXIST,
                message: 'event.error.eventExist',
            });
        }

        const session: ClientSession =
            await this.databaseConnection.startSession();
        session.startTransaction();

        try {
            const event = await this.eventService.create(body, user._id, {
                session,
            });

            await session.commitTransaction();
            await session.endSession();

            return {
                data: { _id: event._id },
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

    // region Get ALl Categories
    // @ResponsePaging('category.list')
    // @PolicyAbilityProtected({
    //     subject: ENUM_POLICY_SUBJECT.CATEGORY,
    //     action: [ENUM_POLICY_ACTION.READ],
    // })
    // @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.ADMIN)
    // @AuthJwtAccessProtected()
    // @ApiKeyProtected()
    // @Get('/list')
    // async list(
    //     @PaginationQuery({
    //         availableSearch: CATEGORY_DEFAULT_AVAILABLE_SEARCH,
    //     })
    //     { _search, _limit, _offset, _order }: PaginationListDto,
    //     @PaginationQueryFilterInBoolean('isActive', CATEGORY_DEFAULT_IS_ACTIVE)
    //     isActive: Record<string, any>
    // ): Promise<IResponsePaging<CategoryListResponseDto>> {
    //     console.log(JSON.stringify(isActive, null, 2));
    //     const find: Record<string, any> = {
    //         ..._search,
    //         ...isActive,
    //     };
    //
    //     const categories: EventDoc[] = await this.eventService.findAll(find, {
    //         paging: {
    //             limit: _limit,
    //             offset: _offset,
    //         },
    //         order: _order,
    //     });
    //     const total: number = await this.eventService.getTotal(find);
    //     const totalPage: number = this.paginationService.totalPage(
    //         total,
    //         _limit
    //     );
    //
    //     const mapped: EventListResponseDto[] =
    //         await this.eventService.mapList(categories);
    //
    //     return {
    //         _pagination: { total, totalPage },
    //         data: mapped,
    //     };
    // }

    // endregion

    // region Get Event Details
    // @Response('event.get')
    // @PolicyAbilityProtected({
    //     subject: ENUM_POLICY_SUBJECT.CATEGORY,
    //     action: [ENUM_POLICY_ACTION.READ],
    // })
    // @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.ADMIN)
    // @AuthJwtAccessProtected()
    // @Get('/get/:event')
    // async get(
    //     @Param('event', RequestRequiredPipe, EventParsePipe)
    //     event: EventDoc
    // ): Promise<IResponse<EventGetResponseDto>> {
    //     const mapped: EventGetResponseDto =
    //         await this.eventService.mapGet(event);
    //     return { data: mapped };
    // }

    // endregion
}
