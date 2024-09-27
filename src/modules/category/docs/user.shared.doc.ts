import { applyDecorators } from '@nestjs/common';
import {
    Doc,
    DocAuth,
    DocGuard,
    DocResponsePaging,
} from 'src/common/doc/decorators/doc.decorator';
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
