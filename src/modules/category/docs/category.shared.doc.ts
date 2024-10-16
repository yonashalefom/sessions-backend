import { applyDecorators } from '@nestjs/common';
import {
    Doc,
    DocAuth,
    DocGuard,
    DocRequest,
    DocResponse,
    DocResponsePaging,
} from 'src/common/doc/decorators/doc.decorator';
import { CategoryDocParamsId } from 'src/modules/category/constants/category.doc.constant';
import { CategoryGetResponseDto } from 'src/modules/category/dtos/response/category.get.response.dto';
import { CategoryListResponseDto } from 'src/modules/category/dtos/response/category.list.response.dto';

export function CategoryListSharedDoc(): MethodDecorator {
    return applyDecorators(
        Doc({
            summary: 'get all categories',
        }),
        DocAuth({
            xApiKey: true,
            jwtAccessToken: true,
        }),
        DocGuard({ role: true, policy: true }),
        DocResponsePaging<CategoryListResponseDto>('category.list', {
            dto: CategoryListResponseDto,
        })
    );
}

export function CategoryDetailsGetDoc(): MethodDecorator {
    return applyDecorators(
        Doc({
            summary: 'get category details',
        }),
        DocRequest({
            params: CategoryDocParamsId,
        }),
        DocAuth({
            xApiKey: true,
            jwtAccessToken: true,
        }),
        DocGuard({ role: true, policy: true }),
        DocResponse<CategoryGetResponseDto>('category.get', {
            dto: CategoryGetResponseDto,
        })
    );
}
