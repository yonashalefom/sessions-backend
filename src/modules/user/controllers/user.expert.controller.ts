import { Body, Controller, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/common/response/decorators/response.decorator';
import { ApiKeyProtected } from 'src/modules/api-key/decorators/api-key.decorator';
import {
    AuthJwtAccessProtected,
    AuthJwtPayload,
} from 'src/modules/auth/decorators/auth.jwt.decorator';
import { AuthJwtAccessPayloadDto } from 'src/modules/auth/dtos/jwt/auth.jwt.access-payload.dto';
import { PolicyRoleProtected } from 'src/modules/policy/decorators/policy.decorator';
import { ENUM_POLICY_ROLE_TYPE } from 'src/modules/policy/enums/policy.enum';
import { ExpertAvailabilityCreateValidation } from 'src/modules/user/decorators/user.common.decorator';
import { ExpertUpdateAvailabilityDoc } from 'src/modules/user/docs/user.expert.doc';
import { ExpertUpdateAvailabilityRequestDto } from 'src/modules/user/dtos/request/user.update-availability.dto';
import { UserParsePipe } from 'src/modules/user/pipes/user.parse.pipe';
import { UserDoc } from 'src/modules/user/repository/entities/user.entity';
import { UserService } from 'src/modules/user/services/user.service';

@ApiTags('modules.shared.user')
@Controller({
    version: '1',
    path: '/',
})
export class UserExpertController {
    constructor(private readonly userService: UserService) {}

    // region Update Expert Availability Time
    @ExpertUpdateAvailabilityDoc()
    @Response('expert.updateAvailabilitySuccess')
    @ExpertAvailabilityCreateValidation()
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.EXPERT)
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Put('availability/update')
    async updateAvailability(
        @AuthJwtPayload<AuthJwtAccessPayloadDto>('_id', UserParsePipe)
        user: UserDoc,
        @Body()
        { ...body }: ExpertUpdateAvailabilityRequestDto
    ): Promise<void> {
        await this.userService.updateAvailability(user, { ...body });

        return;
    }
    // endregion
}
