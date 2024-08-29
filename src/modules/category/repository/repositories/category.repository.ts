import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { DatabaseRepositoryAbstract } from 'src/common/database/abstracts/database.repository.abstract';
import { DatabaseModel } from 'src/common/database/decorators/database.decorator';
import {
    CategoryDoc,
    CategoryEntity,
} from 'src/modules/category/repository/entities/category.entity';

@Injectable()
export class CategoryRepository extends DatabaseRepositoryAbstract<
    CategoryEntity,
    CategoryDoc
> {
    constructor(
        @DatabaseModel(CategoryEntity.name)
        private readonly categoryModel: Model<CategoryEntity>
    ) {
        super(categoryModel);
    }
}
