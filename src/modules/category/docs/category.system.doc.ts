import { applyDecorators } from '@nestjs/common';
import {
    DocAuth,
    DocResponsePaging,
} from 'src/common/doc/decorators/doc.decorator';
import { Doc } from 'src/common/doc/decorators/doc.decorator';
import { CategoryListResponseDto } from 'src/modules/category/dtos/response/category.list.response.dto';

export function CategorySystemListDoc(): MethodDecorator {
    return applyDecorators(
        Doc({ summary: 'get all list categories' }),
        DocAuth({ xApiKey: true }),
        DocResponsePaging<CategoryListResponseDto>('category.list', {
            dto: CategoryListResponseDto,
        })
    );
}
