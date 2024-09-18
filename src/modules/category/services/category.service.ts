import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Document } from 'mongoose';
import { DatabaseQueryContain } from 'src/common/database/decorators/database.decorator';
import {
    IDatabaseCreateManyOptions,
    IDatabaseCreateOptions,
    IDatabaseDeleteManyOptions,
    IDatabaseFindAllOptions,
    IDatabaseGetTotalOptions,
    IDatabaseOptions,
} from 'src/common/database/interfaces/database.interface';
import { CategoryCreateRequestDto } from 'src/modules/category/dtos/request/category.create.request.dto';
import { CategoryGetResponseDto } from 'src/modules/category/dtos/response/category.get.response.dto';
import { CategoryListResponseDto } from 'src/modules/category/dtos/response/category.list.response.dto';
import { CategoryShortResponseDto } from 'src/modules/category/dtos/response/category.short.response.dto';
import { ICategoryService } from 'src/modules/category/interfaces/category.service.interface';
import {
    CategoryDoc,
    CategoryEntity,
} from 'src/modules/category/repository/entities/category.entity';
import { CategoryRepository } from 'src/modules/category/repository/repositories/category.repository';

@Injectable()
export class CategoryService implements ICategoryService {
    constructor(private readonly categoryRepository: CategoryRepository) {}

    async findAll(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<CategoryDoc[]> {
        return this.categoryRepository.findAll(find, options);
    }

    async findOne(
        find: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<CategoryDoc> {
        return this.categoryRepository.findOne(find, options);
    }

    async findOneByCategory(
        category: string,
        options?: IDatabaseOptions
    ): Promise<CategoryDoc> {
        return this.categoryRepository.findOne(
            DatabaseQueryContain('category', category),
            options
        );
    }

    async findOneById(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<CategoryDoc> {
        return this.categoryRepository.findOneById(_id, options);
    }

    async findOneActiveById(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<CategoryDoc> {
        return this.categoryRepository.findOne(
            { _id, isActive: true },
            options
        );
    }

    async getTotal(
        find?: Record<string, any>,
        options?: IDatabaseGetTotalOptions
    ): Promise<number> {
        return this.categoryRepository.getTotal(find, options);
    }

    async deleteMany(
        find: Record<string, any>,
        options?: IDatabaseDeleteManyOptions
    ): Promise<boolean> {
        try {
            await this.categoryRepository.deleteMany(find, options);

            return true;
        } catch (error: unknown) {
            throw error;
        }
    }

    async create(
        { category, description }: CategoryCreateRequestDto,
        options?: IDatabaseCreateOptions
    ): Promise<CategoryDoc> {
        const create: CategoryEntity = new CategoryEntity();
        create.category = category;
        create.description = description;
        create.isActive = true;

        return this.categoryRepository.create<CategoryEntity>(create, options);
    }

    async createMany(
        data: CategoryCreateRequestDto[],
        options?: IDatabaseCreateManyOptions
    ): Promise<boolean> {
        try {
            const entities: CategoryEntity[] = data.map(
                ({ category, description }): CategoryCreateRequestDto => {
                    const create: CategoryEntity = new CategoryEntity();
                    create.category = category;
                    create.description = description;

                    return create;
                }
            ) as CategoryEntity[];

            await this.categoryRepository.createMany(entities, options);

            return true;
        } catch (error: unknown) {
            throw error;
        }
    }

    async mapList(
        countries: CategoryDoc[] | CategoryEntity[]
    ): Promise<CategoryListResponseDto[]> {
        return plainToInstance(
            CategoryListResponseDto,
            countries.map((e: CategoryDoc | CategoryEntity) =>
                e instanceof Document ? e.toObject() : e
            )
        );
    }

    async mapGet(
        category: CategoryDoc | CategoryEntity
    ): Promise<CategoryGetResponseDto> {
        return plainToInstance(
            CategoryGetResponseDto,
            category instanceof Document ? category.toObject() : category
        );
    }

    async mapShort(
        countries: CategoryDoc[] | CategoryEntity[]
    ): Promise<CategoryShortResponseDto[]> {
        return plainToInstance(
            CategoryShortResponseDto,
            countries.map((e: CategoryDoc | CategoryEntity) =>
                e instanceof Document ? e.toObject() : e
            )
        );
    }

    async filterValidExpertise(ids: string[]): Promise<string[]> {
        // Fetch only the IDs that exist in the database
        const existingExpertise = await this.findAll({ _id: { $in: ids } });

        // Extract the valid IDs
        const existingIds = existingExpertise.map(expertise =>
            expertise._id.toString()
        );

        // Return only the IDs that exist
        return ids.filter(id => existingIds.includes(id));
    }
}
