import {
    Body,
    ConflictException,
    Controller,
    InternalServerErrorException,
    Post,
} from '@nestjs/common';
import { ClientSession, Connection } from 'mongoose';
import { ENUM_APP_STATUS_CODE_ERROR } from 'src/app/enums/app.status-code.enum';
import { DatabaseConnection } from 'src/common/database/decorators/database.decorator';
import { DatabaseIdResponseDto } from 'src/common/database/dtos/response/database.id.response.dto';
import { ApiKeyProtected } from 'src/modules/api-key/decorators/api-key.decorator';
import {
    AuthJwtAccessProtected,
    AuthJwtPayload,
} from 'src/modules/auth/decorators/auth.jwt.decorator';
import { PaginationService } from 'src/common/pagination/services/pagination.service';
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
import { CreateScheduleValidation } from 'src/modules/schedules/decorators/schedule.common.decorator';
import { ScheduleCreateRequestDto } from 'src/modules/schedules/dtos/request/schedule.create.request.dto';
import { checkAvailabilityOverlap } from 'src/modules/schedules/helpers/schedule.helper';
import { ScheduleService } from 'src/modules/schedules/services/schedule.service';
import { ENUM_USER_STATUS_CODE_ERROR } from 'src/modules/user/enums/user.status-code.enum';
import { UserParsePipe } from 'src/modules/user/pipes/user.parse.pipe';
import { UserDoc } from 'src/modules/user/repository/entities/user.entity';

@Controller({
    version: '1',
    path: '/schedule',
})
export class ScheduleExpertController {
    constructor(
        @DatabaseConnection() private readonly databaseConnection: Connection,
        private readonly scheduleService: ScheduleService,
        private readonly paginationService: PaginationService
    ) {}

    // region Create New Schedule
    @Response('schedule.create')
    @CreateScheduleValidation()
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.SCHEDULE,
        action: [ENUM_POLICY_ACTION.CREATE],
    })
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.EXPERT)
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Post('/create')
    async createEvent(
        @AuthJwtPayload('_id', UserParsePipe) user: UserDoc,
        @Body()
        body: ScheduleCreateRequestDto
    ): Promise<IResponse<DatabaseIdResponseDto>> {
        const { title, timeZone, availability } = body;

        // Get User's Existing Schedules
        const existingSchedules = await this.scheduleService.findAll({
            userId: user._id,
        });

        // console.log('*****************************************');
        // console.log("User's Existing Schedules: ");
        // console.log('*****************************************');
        console.log(JSON.stringify(existingSchedules, null, 2));

        for (const newAvailability of availability) {
            // console.log('---------------------------------');
            // console.log('New Availability:');
            // console.log(JSON.stringify(newAvailability, null, 2));
            // console.log('New Availability Time Zone:');
            // console.log(timeZone);
            // console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
            for (const existingSchedule of existingSchedules) {
                // console.log('---------------------------------');
                // console.log('Existing Schedule:');
                // console.log(JSON.stringify(existingSchedule, null, 2));
                // console.log('Existing Schedule Time Zone:');
                // console.log(existingSchedule.timeZone);
                // console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^'); // adfds
                for (const existingAvailability of existingSchedule.availability) {
                    // console.log('---------------------------------');
                    // console.log('Existing Availability:');
                    // console.log(JSON.stringify(existingAvailability, null, 2));
                    // console.log('will be sent as []');
                    // console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
                    if (
                        checkAvailabilityOverlap(
                            newAvailability,
                            [existingAvailability], // Compare one availability at a time
                            timeZone,
                            existingSchedule.timeZone // Use time zone from existing schedule
                        )
                    ) {
                        // console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%');
                        // console.log('Has Overlap');
                        // console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%');
                        throw new ConflictException(
                            'The schedule overlaps with an existing schedule.'
                        );
                    }
                }
            }
        }

        const eventDoc = await this.scheduleService.checkScheduleAlreadyExists(
            title,
            user._id
        );

        if (eventDoc) {
            throw new ConflictException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.EMAIL_EXIST,
                message: 'schedule.error.scheduleExist',
            });
        }

        const session: ClientSession =
            await this.databaseConnection.startSession();
        session.startTransaction();

        try {
            const schedule = await this.scheduleService.create(body, user._id, {
                session,
            });

            await session.commitTransaction();
            await session.endSession();

            return {
                data: { _id: schedule._id },
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
