import {
    IDatabaseCreateManyOptions,
    IDatabaseDeleteManyOptions,
    IDatabaseFindAllOptions,
    IDatabaseGetTotalOptions,
    IDatabaseOptions,
} from 'src/common/database/interfaces/database.interface';
import { CategoryCreateRequestDto } from 'src/modules/category/dtos/request/category.create.request.dto';
import { CategoryGetResponseDto } from 'src/modules/category/dtos/response/category.get.response.dto';
import { CategoryListResponseDto } from 'src/modules/category/dtos/response/category.list.response.dto';
import { CategoryShortResponseDto } from 'src/modules/category/dtos/response/category.short.response.dto';
import {
    CategoryDoc,
    CategoryEntity,
} from 'src/modules/category/repository/entities/category.entity';

export interface ICategoryService {
    findAll(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<CategoryDoc[]>;
    findOne(
        find: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<CategoryDoc>;
    findOneByCategory(
        name: string,
        options?: IDatabaseOptions
    ): Promise<CategoryDoc>;
    findOneById(_id: string, options?: IDatabaseOptions): Promise<CategoryDoc>;
    findOneActiveById(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<CategoryDoc>;
    getTotal(
        find?: Record<string, any>,
        options?: IDatabaseGetTotalOptions
    ): Promise<number>;
    deleteMany(
        find: Record<string, any>,
        options?: IDatabaseDeleteManyOptions
    ): Promise<boolean>;
    createMany(
        data: CategoryCreateRequestDto[],
        options?: IDatabaseCreateManyOptions
    ): Promise<boolean>;
    mapList(
        countries: CategoryDoc[] | CategoryEntity[]
    ): Promise<CategoryListResponseDto[]>;
    mapGet(
        category: CategoryDoc | CategoryEntity
    ): Promise<CategoryGetResponseDto>;
    mapShort(
        categories: CategoryDoc[] | CategoryEntity[]
    ): Promise<CategoryShortResponseDto[]>;
}
