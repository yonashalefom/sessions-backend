import { applyDecorators } from '@nestjs/common';
import {
    Doc,
    DocAuth,
    DocGuard,
    DocRequest,
    DocResponse,
} from 'src/common/doc/decorators/doc.decorator';
import { UserDocParamsId } from 'src/modules/user/constants/user.doc.constant';
import { UserProfileResponseDto } from 'src/modules/user/dtos/response/user.profile.response.dto';

export function UserGetExpertProfileDoc(): MethodDecorator {
    return applyDecorators(
        Doc({
            summary: 'Get expert user profile.',
        }),
        DocRequest({
            params: UserDocParamsId,
        }),
        DocAuth({
            xApiKey: true,
            jwtAccessToken: true,
        }),
        DocGuard({ role: true, policy: true }),
        DocResponse<UserProfileResponseDto>('expert.getExpertProfileSuccess', {
            dto: UserProfileResponseDto,
        })
    );
}
