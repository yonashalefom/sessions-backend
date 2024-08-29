import { Module } from '@nestjs/common';
import { CategoryRepositoryModule } from 'src/modules/category/repository/category.repository.module';
import { CategoryService } from 'src/modules/category/services/category.service';

@Module({
    imports: [CategoryRepositoryModule],
    exports: [CategoryService],
    providers: [CategoryService],
    controllers: [],
})
export class CategoryModule {}
