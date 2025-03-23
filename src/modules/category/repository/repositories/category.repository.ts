import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectDatabaseModel } from 'src/common/database/decorators/database.decorator';
import {
    CategoryDoc,
    CategoryEntity,
} from 'src/modules/category/repository/entities/category.entity';
import { DatabaseRepositoryBase } from 'src/common/database/bases/database.repository';

@Injectable()
export class CategoryRepository extends DatabaseRepositoryBase<
    CategoryEntity,
    CategoryDoc
> {
    constructor(
        @InjectDatabaseModel(CategoryEntity.name)
        private readonly categoryModel: Model<CategoryEntity>
    ) {
        super(categoryModel);
    }
}
