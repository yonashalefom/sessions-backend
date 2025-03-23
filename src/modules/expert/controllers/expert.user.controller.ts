import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    PaginationQuery,
    PaginationQueryFilterInEnum,
} from 'src/common/pagination/decorators/pagination.decorator';
import { PaginationListDto } from 'src/common/pagination/dtos/pagination.list.dto';
import { PaginationService } from 'src/common/pagination/services/pagination.service';
import { RequestRequiredPipe } from 'src/common/request/pipes/request.required.pipe';
import { ResponsePaging } from 'src/common/response/decorators/response.decorator';
import { IResponsePaging } from 'src/common/response/interfaces/response.interface';
import { ApiKeyProtected } from 'src/modules/api-key/decorators/api-key.decorator';
import { AuthJwtAccessProtected } from 'src/modules/auth/decorators/auth.jwt.decorator';
import {
    EXPERT_DEFAULT_AVAILABLE_ORDER_BY,
    EXPERT_DEFAULT_AVAILABLE_SEARCH,
} from 'src/modules/expert/constants/expert.list.constant';
import {
    GetExpertsByCategoryDoc,
    UserExpertsListDoc,
} from 'src/modules/expert/docs/expert.doc';
import { CategoryParseByIdPipe } from 'src/modules/expert/pipes/category.parse.by.id.pipe';
import { CategoryParseBySlugPipe } from 'src/modules/expert/pipes/category.parse.by.slug.pipe';
import {
    PolicyAbilityProtected,
    PolicyRoleProtected,
} from 'src/modules/policy/decorators/policy.decorator';
import {
    ENUM_POLICY_ACTION,
    ENUM_POLICY_ROLE_TYPE,
    ENUM_POLICY_SUBJECT,
} from 'src/modules/policy/enums/policy.enum';
import { USER_DEFAULT_STATUS } from 'src/modules/user/constants/user.list.constant';
import { ExpertsListByCategoryResponseDto } from 'src/modules/user/dtos/response/experts.list.by.category.response.dto';
import { UserListResponseDto } from 'src/modules/user/dtos/response/user.list.response.dto';
import { ENUM_ACTIVE_USER_STATUS } from 'src/modules/user/enums/user.enum';
import { IUserDoc } from 'src/modules/user/interfaces/user.interface';
import { UserService } from 'src/modules/user/services/user.service';
import { CategoryDoc } from 'src/modules/category/repository/entities/category.entity';
import { UserProtected } from 'src/modules/user/decorators/user.decorator';

@ApiTags('modules.shared.expert')
@Controller({
    version: '1',
    path: '/experts',
})
export class ExpertUserController {
    constructor(
        private readonly userService: UserService,
        private readonly paginationService: PaginationService
    ) {}

    // region Get All Experts
    @UserExpertsListDoc()
    @ResponsePaging('expert.getAllExperts')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.EXPERT,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.USER)
    @UserProtected()
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Get('/get/all')
    async getAllExperts(
        @PaginationQuery({
            availableSearch: EXPERT_DEFAULT_AVAILABLE_SEARCH,
        })
        { _search, _limit, _offset, _order }: PaginationListDto,
        @PaginationQueryFilterInEnum(
            'status',
            USER_DEFAULT_STATUS,
            ENUM_ACTIVE_USER_STATUS
        )
        status: Record<string, any>
    ): Promise<IResponsePaging<UserListResponseDto>> {
        const role = {
            role: '16c4b7f3-0c6b-4a99-a560-3ee99c1b0730',
        };

        const find: Record<string, any> = {
            ..._search,
            ...status,
            ...role,
        };

        const experts: IUserDoc[] =
            await this.userService.findAllWithRoleAndCountryFromOldSessions(
                find,
                {
                    paging: {
                        limit: _limit,
                        offset: _offset,
                    },
                    order: _order,
                }
            );
        const total: number = await this.userService.getTotal(find);
        const totalPage: number = this.paginationService.totalPage(
            total,
            _limit
        );

        console.log(JSON.stringify(experts, null, 2));

        const mapped = await this.userService.mapList(experts);

        return {
            _pagination: { total, totalPage },
            data: mapped,
        };
    }
    // endregion

    // region Get Experts by Expertise Id
    @GetExpertsByCategoryDoc()
    @ResponsePaging('expert.getExpertsByCategory')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.EXPERT,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.USER)
    @UserProtected()
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Get('get/by/expertise/:expertiseId')
    async getExpertsByExpertise(
        @PaginationQuery({
            availableSearch: EXPERT_DEFAULT_AVAILABLE_SEARCH,
        })
        { _search, _limit, _offset, _order }: PaginationListDto,
        @PaginationQueryFilterInEnum(
            'status',
            USER_DEFAULT_STATUS,
            ENUM_ACTIVE_USER_STATUS
        )
        status: Record<string, any>,
        @Param('expertiseId', RequestRequiredPipe, CategoryParseByIdPipe)
        expertiseCategoryDoc: CategoryDoc
    ): Promise<IResponsePaging<UserListResponseDto>> {
        const role = {
            role: '16c4b7f3-0c6b-4a99-a560-3ee99c1b0730',
        };

        const expertise = { expertise: { $in: [expertiseCategoryDoc._id] } };

        const find: Record<string, any> = {
            ..._search,
            ...status,
            ...role,
            ...expertise,
        };

        const experts: IUserDoc[] =
            await this.userService.findAllWithRoleAndCountryFromOldSessions(
                find,
                {
                    paging: {
                        limit: _limit,
                        offset: _offset,
                    },
                    order: _order,
                }
            );
        const total: number = await this.userService.getTotal(find);
        const totalPage: number = this.paginationService.totalPage(
            total,
            _limit
        );

        const mapped = await this.userService.mapList(experts);

        return {
            _pagination: { total, totalPage },
            data: mapped,
        };
    }
    // endregion

    // region Get Experts by Expertise Slug
    @GetExpertsByCategoryDoc()
    @ResponsePaging('expert.getExpertsByCategory')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.EXPERT,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.USER)
    @UserProtected()
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Get('get/by/expertise/slug/:expertiseSlug')
    async getExpertsByExpertiseSlug(
        @PaginationQuery({
            availableSearch: EXPERT_DEFAULT_AVAILABLE_SEARCH,
        })
        { _search, _limit, _offset, _order }: PaginationListDto,
        @PaginationQueryFilterInEnum(
            'status',
            USER_DEFAULT_STATUS,
            ENUM_ACTIVE_USER_STATUS
        )
        status: Record<string, any>,
        @Param('expertiseSlug', RequestRequiredPipe, CategoryParseBySlugPipe)
        expertiseCategoryDoc: CategoryDoc
    ): Promise<IResponsePaging<UserListResponseDto>> {
        console.log(JSON.stringify(expertiseCategoryDoc, null, 2));
        const role = {
            role: '16c4b7f3-0c6b-4a99-a560-3ee99c1b0730',
        };

        const expertise = { expertise: { $in: [expertiseCategoryDoc._id] } };

        const find: Record<string, any> = {
            ..._search,
            ...status,
            ...role,
            ...expertise,
        };

        const experts: IUserDoc[] =
            await this.userService.findAllWithRoleAndCountryFromOldSessions(
                find,
                {
                    paging: {
                        limit: _limit,
                        offset: _offset,
                    },
                    order: _order,
                }
            );
        const total: number = await this.userService.getTotal(find);
        const totalPage: number = this.paginationService.totalPage(
            total,
            _limit
        );

        const mapped = await this.userService.mapList(experts);

        return {
            _pagination: { total, totalPage },
            data: mapped,
        };
    }
    // endregion

    // region Get All Experts (Group By Category)
    @UserExpertsListDoc()
    @ResponsePaging('expert.getAllExpertsByCategory')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.EXPERT,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.USER)
    @UserProtected()
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Get('get/all/by-category')
    async getAllExpertsGroupByExpertise(
        @PaginationQuery({
            availableSearch: EXPERT_DEFAULT_AVAILABLE_SEARCH,
            availableOrderBy: EXPERT_DEFAULT_AVAILABLE_ORDER_BY,
        })
        { _search, _limit, _offset, _order }: PaginationListDto
    ): Promise<IResponsePaging<ExpertsListByCategoryResponseDto>> {
        return await this.userService.getAllExpertsGroupByExpertise({
            _search,
            _limit,
            _offset,
            _order,
        });
    }
    // endregion
}
