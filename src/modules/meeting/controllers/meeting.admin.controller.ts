import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetRateLimitsResponse } from '@stream-io/node-sdk';
import { StreamResponse } from '@stream-io/node-sdk/dist/src/types';
import { PaginationService } from 'src/common/pagination/services/pagination.service';
import { Response } from 'src/common/response/decorators/response.decorator';
import { IResponse } from 'src/common/response/interfaces/response.interface';
import { MeetingService } from 'src/modules/meeting/services/meeting.service';
import {
    PolicyAbilityProtected,
    PolicyRoleProtected,
} from 'src/modules/policy/decorators/policy.decorator';
import {
    ENUM_POLICY_ACTION,
    ENUM_POLICY_ROLE_TYPE,
    ENUM_POLICY_SUBJECT,
} from 'src/modules/policy/enums/policy.enum';
import { ApiKeyProtected } from 'src/modules/api-key/decorators/api-key.decorator';
import { AuthJwtAccessProtected } from 'src/modules/auth/decorators/auth.jwt.decorator';
import { RoleService } from 'src/modules/role/services/role.service';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { Connection } from 'mongoose';
import { DatabaseConnection } from 'src/common/database/decorators/database.decorator';
import { CountryService } from 'src/modules/country/services/country.service';
import { UserService } from 'src/modules/user/services/user.service';
import { Queue } from 'bullmq';
import { ENUM_WORKER_QUEUES } from 'src/worker/enums/worker.enum';
import { WorkerQueue } from 'src/worker/decorators/worker.decorator';

@ApiTags('modules.admin.user')
@Controller({
    version: '1',
    path: '/meeting',
})
export class MeetingAdminController {
    constructor(
        @DatabaseConnection() private readonly databaseConnection: Connection,
        @WorkerQueue(ENUM_WORKER_QUEUES.EMAIL_QUEUE)
        private readonly emailQueue: Queue,
        private readonly paginationService: PaginationService,
        private readonly roleService: RoleService,
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly meetingService: MeetingService,
        private readonly countryService: CountryService
    ) {}

    // region Get Server Rate Limit
    @Response('meeting.getServerRateLimit')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.MEETING,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.ADMIN)
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Get('/get/rate-limit/server')
    async get(): Promise<IResponse<StreamResponse<GetRateLimitsResponse>>> {
        const rateLimit = await this.meetingService.getServerSideRateLimit();

        return { data: rateLimit };
    }

    // endregion
}
