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
import { ENUM_SCHEDULE_STATUS_CODE_ERROR } from 'src/modules/schedules/enums/schedule.status-code.enum';
import { ScheduleService } from 'src/modules/schedules/services/schedule.service';
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
    async createNewSchedule(
        @AuthJwtPayload('_id', UserParsePipe) user: UserDoc,
        @Body()
        body: ScheduleCreateRequestDto
    ): Promise<IResponse<DatabaseIdResponseDto>> {
        const { title, timeZone, availability } = body;

        // region Check if Schedule Title Already Exists
        const scheduleDoc =
            await this.scheduleService.checkScheduleAlreadyExists(
                title,
                user._id
            );

        if (scheduleDoc) {
            throw new ConflictException({
                statusCode: ENUM_SCHEDULE_STATUS_CODE_ERROR.TITLE_EXIST,
                message: 'schedule.error.titleExist',
            });
        }
        // endregion

        // region Check Schedule Overlap
        const existingSchedules = await this.scheduleService.findAll({
            userId: user._id,
        });

        for (const newAvailability of availability) {
            for (const existingSchedule of existingSchedules) {
                for (const existingAvailability of existingSchedule.availability) {
                    if (
                        this.scheduleService.checkAvailabilityOverlap(
                            newAvailability,
                            [existingAvailability], // Compare one availability at a time
                            timeZone,
                            existingSchedule.timeZone // Use time zone from existing schedule
                        )
                    ) {
                        throw new ConflictException(
                            'The schedule overlaps with an existing schedule.'
                        );
                    }
                }
            }
        }
        // endregion

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
}
