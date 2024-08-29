import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_CONNECTION_NAME } from 'src/common/database/constants/database.constant';
import {
    CategoryEntity,
    CategorySchema,
} from 'src/modules/category/repository/entities/category.entity';
import { CategoryRepository } from 'src/modules/category/repository/repositories/category.repository';

@Module({
    providers: [CategoryRepository],
    exports: [CategoryRepository],
    controllers: [],
    imports: [
        MongooseModule.forFeature(
            [
                {
                    name: CategoryEntity.name,
                    schema: CategorySchema,
                },
            ],
            DATABASE_CONNECTION_NAME
        ),
    ],
})
export class CategoryRepositoryModule {}
