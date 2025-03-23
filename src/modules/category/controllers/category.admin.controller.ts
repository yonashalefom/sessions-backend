import {
    Body,
    ConflictException,
    Controller,
    Get,
    InternalServerErrorException,
    Param,
    Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientSession, Connection } from 'mongoose';
import { ENUM_APP_STATUS_CODE_ERROR } from 'src/app/enums/app.status-code.enum';
import { InjectDatabaseConnection } from 'src/common/database/decorators/database.decorator';
import { DatabaseIdResponseDto } from 'src/common/database/dtos/response/database.id.response.dto';
import { ApiKeyProtected } from 'src/modules/api-key/decorators/api-key.decorator';
import { AuthJwtAccessProtected } from 'src/modules/auth/decorators/auth.jwt.decorator';
import {
    PaginationQuery,
    PaginationQueryFilterInBoolean,
} from 'src/common/pagination/decorators/pagination.decorator';
import { PaginationListDto } from 'src/common/pagination/dtos/pagination.list.dto';
import { PaginationService } from 'src/common/pagination/services/pagination.service';
import { CategoryCreateRequestDto } from 'src/modules/category/dtos/request/category.create.request.dto';
import {
    ENUM_POLICY_ACTION,
    ENUM_POLICY_ROLE_TYPE,
    ENUM_POLICY_SUBJECT,
} from 'src/modules/policy/enums/policy.enum';
import {
    PolicyAbilityProtected,
    PolicyRoleProtected,
} from 'src/modules/policy/decorators/policy.decorator';
import { RequestRequiredPipe } from 'src/common/request/pipes/request.required.pipe';
import {
    Response,
    ResponsePaging,
} from 'src/common/response/decorators/response.decorator';
import {
    IResponse,
    IResponsePaging,
} from 'src/common/response/interfaces/response.interface';
import {
    CATEGORY_DEFAULT_AVAILABLE_SEARCH,
    CATEGORY_DEFAULT_IS_ACTIVE,
} from 'src/modules/category/constants/category.list.constant';
import {
    CategoryAdminGetDoc,
    CategoryAdminListDoc,
} from 'src/modules/category/docs/category.admin.doc';
import { CategoryGetResponseDto } from 'src/modules/category/dtos/response/category.get.response.dto';
import { CategoryListResponseDto } from 'src/modules/category/dtos/response/category.list.response.dto';
import { CategoryParsePipe } from 'src/modules/category/pipes/category.parse.pipe';
import { CategoryDoc } from 'src/modules/category/repository/entities/category.entity';
import { CategoryService } from 'src/modules/category/services/category.service';
import { ENUM_USER_STATUS_CODE_ERROR } from 'src/modules/user/enums/user.status-code.enum';
import { UserProtected } from 'src/modules/user/decorators/user.decorator';

@ApiTags('modules.admin.category')
@Controller({
    version: '1',
    path: '/category',
})
export class CategoryAdminController {
    constructor(
        @InjectDatabaseConnection()
        private readonly databaseConnection: Connection,
        private readonly categoryService: CategoryService,
        private readonly paginationService: PaginationService
    ) {}

    // region Create New Category
    @Response('category.create')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.CATEGORY,
        action: [ENUM_POLICY_ACTION.CREATE],
    })
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.ADMIN)
    @UserProtected()
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Post('/create')
    async createCategory(
        @Body()
        body: CategoryCreateRequestDto
    ): Promise<IResponse<DatabaseIdResponseDto>> {
        const { category } = body;
        const categoryDoc =
            await this.categoryService.findOneByCategory(category);

        if (categoryDoc) {
            throw new ConflictException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.EMAIL_EXIST,
                message: 'category.error.categoryExist',
            });
        }

        const session: ClientSession =
            await this.databaseConnection.startSession();
        session.startTransaction();

        try {
            const category = await this.categoryService.create(body, {
                session,
            });

            await session.commitTransaction();
            await session.endSession();

            return {
                data: { _id: category._id },
            };
        } catch (err: any) {
            await session.abortTransaction();
            await session.endSession();

            throw new InternalServerErrorException({
                statusCode: ENUM_APP_STATUS_CODE_ERROR.UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }
    }

    // endregion

    // region Get ALl Categories
    @CategoryAdminListDoc()
    @ResponsePaging('category.list')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.CATEGORY,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.ADMIN)
    @UserProtected()
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Get('/list')
    async list(
        @PaginationQuery({
            availableSearch: CATEGORY_DEFAULT_AVAILABLE_SEARCH,
        })
        { _search, _limit, _offset, _order }: PaginationListDto,
        @PaginationQueryFilterInBoolean('isActive', CATEGORY_DEFAULT_IS_ACTIVE)
        isActive: Record<string, any>
    ): Promise<IResponsePaging<CategoryListResponseDto>> {
        console.log(JSON.stringify(isActive, null, 2));
        const find: Record<string, any> = {
            ..._search,
            ...isActive,
        };

        const categories: CategoryDoc[] = await this.categoryService.findAll(
            find,
            {
                paging: {
                    limit: _limit,
                    offset: _offset,
                },
                order: _order,
            }
        );
        const total: number = await this.categoryService.getTotal(find);
        const totalPage: number = this.paginationService.totalPage(
            total,
            _limit
        );

        const mapped: CategoryListResponseDto[] =
            await this.categoryService.mapList(categories);

        return {
            _pagination: { total, totalPage },
            data: mapped,
        };
    }

    // endregion

    // region Get Category Details
    @CategoryAdminGetDoc()
    @Response('category.get')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.CATEGORY,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.ADMIN)
    @UserProtected()
    @AuthJwtAccessProtected()
    @Get('/get/:category')
    async get(
        @Param('category', RequestRequiredPipe, CategoryParsePipe)
        category: CategoryDoc
    ): Promise<IResponse<CategoryGetResponseDto>> {
        const mapped: CategoryGetResponseDto =
            await this.categoryService.mapGet(category);
        return { data: mapped };
    }

    // endregion
}
