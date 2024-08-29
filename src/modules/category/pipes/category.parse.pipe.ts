import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { ENUM_CATEGORY_STATUS_CODE_ERROR } from 'src/modules/category/enums/category.status-code.enum';
import { CategoryDoc } from 'src/modules/category/repository/entities/category.entity';
import { CategoryService } from 'src/modules/category/services/category.service';

@Injectable()
export class CategoryParsePipe implements PipeTransform {
    constructor(private readonly categoryService: CategoryService) {}

    async transform(value: any): Promise<CategoryDoc> {
        const category: CategoryDoc =
            await this.categoryService.findOneById(value);
        if (!category) {
            throw new NotFoundException({
                statusCode: ENUM_CATEGORY_STATUS_CODE_ERROR.NOT_FOUND,
                message: 'category.error.notFound',
            });
        }

        return category;
    }
}
