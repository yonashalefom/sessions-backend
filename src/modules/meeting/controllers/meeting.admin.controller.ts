import { Body, Controller, Delete, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    DeleteUsersRequest,
    DeleteUsersResponse,
    GetRateLimitsResponse,
    QueryCallsRequest,
    QueryUsersResponse,
} from '@stream-io/node-sdk';
import { StreamResponse } from '@stream-io/node-sdk/dist/src/types';
import { RequestRequiredPipe } from 'src/common/request/pipes/request.required.pipe';
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
import { UserProtected } from 'src/modules/user/decorators/user.decorator';

@ApiTags('modules.admin.user')
@Controller({
    version: '1',
    path: '/meeting',
})
export class MeetingAdminController {
    constructor(private readonly meetingService: MeetingService) {}

    // region Get Server Rate Limit
    @Response('meeting.getServerRateLimit')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.MEETING,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.ADMIN)
    @UserProtected()
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Get('/get/rate-limit/server')
    async getServerRateLimit(): Promise<
        IResponse<StreamResponse<GetRateLimitsResponse>>
    > {
        const rateLimit = await this.meetingService.getServerSideRateLimit();

        return { data: rateLimit };
    }

    // endregion

    // region Get Async Task Status
    @Response('meeting.getAsyncTaskStats')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.STREAM_ASYNC_TASK,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.ADMIN)
    @UserProtected()
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Get('/get/async-task/:taskId')
    async getAsyncTaskStats(
        @Param('taskId', RequestRequiredPipe)
        taskId: string
    ): Promise<IResponse<DeleteUsersResponse>> {
        const taskStats = await this.meetingService.getAsyncTaskStats(taskId);

        return { data: taskStats };
    }

    // endregion

    // region Get Meeting User Info By Id
    @Response('meeting.getStreamUserInfo')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.MEETING_USER,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.ADMIN)
    @UserProtected()
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Get('/get/user/:userId')
    async getMeetingUserInfo(
        @Param('userId', RequestRequiredPipe)
        userId: string
    ): Promise<IResponse<QueryUsersResponse>> {
        const userInfo = await this.meetingService.getMeetingUserInfo(userId);

        return { data: userInfo };
    }

    // endregion

    // region Get Meeting Call Info By Id
    @Response('meeting.getStreamCallInfo')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.MEETING_CALL,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.ADMIN)
    @UserProtected()
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Get('/get/call/:callId')
    async getMeetingCallInfo(
        @Param('callId', RequestRequiredPipe)
        callId: string
    ): Promise<IResponse<QueryCallsRequest>> {
        const callInfo = await this.meetingService.getMeetingCallInfo(callId);

        return { data: callInfo };
    }

    // endregion

    // region Delete Meeting Calls
    @Response('meeting.deleteCall')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.MEETING,
        action: [ENUM_POLICY_ACTION.DELETE],
    })
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.ADMIN)
    @UserProtected()
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Delete('/calls/delete/:callId')
    async deleteCalls(
        @Param('callId', RequestRequiredPipe)
        callId: string
    ): Promise<IResponse<StreamResponse<GetRateLimitsResponse>>> {
        const deleteCall = await this.meetingService.deleteCall(callId);

        return { data: deleteCall };
    }

    // endregion

    // region Delete Users
    @Response('meeting.deleteUser')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.MEETING_USER,
        action: [ENUM_POLICY_ACTION.DELETE],
    })
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.ADMIN)
    @UserProtected()
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Delete('/users/delete')
    async deleteUsers(
        @Body()
        body: DeleteUsersRequest
    ): Promise<IResponse<DeleteUsersResponse>> {
        const deleteUsers = await this.meetingService.deleteUsers(body);

        return { data: deleteUsers };
    }

    // endregion
}
