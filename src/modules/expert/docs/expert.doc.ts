import { applyDecorators } from '@nestjs/common';
import {
    Doc,
    DocAuth,
    DocRequest,
    DocGuard,
    DocResponsePaging,
} from 'src/common/doc/decorators/doc.decorator';
import {
    UserDocQueryCountry,
    UserDocQueryRole,
    UserDocQueryStatus,
} from 'src/modules/user/constants/user.doc.constant';
import { UserListResponseDto } from 'src/modules/user/dtos/response/user.list.response.dto';

export function UserExpertsListDoc(): MethodDecorator {
    return applyDecorators(
        Doc({
            summary: 'get all experts',
        }),
        DocRequest({
            queries: [
                ...UserDocQueryStatus,
                ...UserDocQueryRole,
                ...UserDocQueryCountry,
            ],
        }),
        DocAuth({
            xApiKey: true,
            jwtAccessToken: true,
        }),
        DocGuard({ role: true, policy: true }),
        DocResponsePaging<UserListResponseDto>('expert.getAllExperts', {
            dto: UserListResponseDto,
        })
    );
}

export function GetExpertsByCategoryDoc(): MethodDecorator {
    return applyDecorators(
        Doc({
            summary: 'get all experts',
        }),
        DocRequest({
            queries: [
                ...UserDocQueryStatus,
                ...UserDocQueryRole,
                ...UserDocQueryCountry,
            ],
        }),
        DocAuth({
            xApiKey: true,
            jwtAccessToken: true,
        }),
        DocGuard({ role: true, policy: true }),
        DocResponsePaging<UserListResponseDto>('expert.getExpertsByCategory', {
            dto: UserListResponseDto,
        })
    );
}
