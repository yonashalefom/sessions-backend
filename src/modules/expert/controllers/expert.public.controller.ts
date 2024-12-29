import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestRequiredPipe } from 'src/common/request/pipes/request.required.pipe';
import { Response } from 'src/common/response/decorators/response.decorator';
import { IResponse } from 'src/common/response/interfaces/response.interface';
import { ApiKeyProtected } from 'src/modules/api-key/decorators/api-key.decorator';
import { ExpertGetExpertProfileDoc } from 'src/modules/expert/docs/expert.public.doc';
import { UserListResponseDto } from 'src/modules/user/dtos/response/user.list.response.dto';
import { IUserDoc } from 'src/modules/user/interfaces/user.interface';
import { UserExpertPipe } from 'src/modules/user/pipes/user.parse.pipe';
import { UserDoc } from 'src/modules/user/repository/entities/user.entity';
import { UserService } from 'src/modules/user/services/user.service';

@ApiTags('modules.public.user')
@Controller({
    version: '1',
    path: '/experts',
})
export class ExpertPublicController {
    constructor(private readonly userService: UserService) {}

    // region Get Expert Profile
    @ExpertGetExpertProfileDoc()
    @Response('expert.getExpertProfileSuccess')
    // @PolicyAbilityProtected({
    //     subject: ENUM_POLICY_SUBJECT.EXPERT,
    //     action: [ENUM_POLICY_ACTION.READ],
    // })
    // @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.USER)
    // @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Get('/get/:expertUsername')
    async get(
        @Param('expertUsername', RequestRequiredPipe, UserExpertPipe)
        user: UserDoc
    ): Promise<IResponse<UserListResponseDto>> {
        const userWithRole: IUserDoc = await this.userService.join(user);
        const mapped: UserListResponseDto =
            await this.userService.mapProfileShort(userWithRole);

        return { data: mapped };
    }

    // endregion
}
