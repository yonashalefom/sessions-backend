import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { CategoryDoc } from 'src/modules/category/repository/entities/category.entity';
import { CategoryService } from 'src/modules/category/services/category.service';
import { ENUM_SETTING_STATUS_CODE_ERROR } from 'src/modules/setting/enums/setting.status-code.enum';

@Injectable()
export class CategoryParseBySlugPipe implements PipeTransform {
    constructor(private readonly categoryService: CategoryService) {}

    async transform(value: any): Promise<CategoryDoc> {
        console.log('Slug is: ' + value);
        const category: CategoryDoc = await this.categoryService.findOne({
            slug: value.toLowerCase(),
        });

        if (!category) {
            throw new NotFoundException({
                statusCode: ENUM_SETTING_STATUS_CODE_ERROR.NOT_FOUND,
                message: 'category.error.notFound',
            });
        }

        return category;
    }
}
