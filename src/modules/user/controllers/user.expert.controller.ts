import { Body, Controller, NotFoundException, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/common/response/decorators/response.decorator';
import { ApiKeyProtected } from 'src/modules/api-key/decorators/api-key.decorator';
import {
    AuthJwtAccessProtected,
    AuthJwtPayload,
} from 'src/modules/auth/decorators/auth.jwt.decorator';
import { AuthJwtAccessPayloadDto } from 'src/modules/auth/dtos/jwt/auth.jwt.access-payload.dto';
import { CategoryService } from 'src/modules/category/services/category.service';
import { PolicyRoleProtected } from 'src/modules/policy/decorators/policy.decorator';
import { ENUM_POLICY_ROLE_TYPE } from 'src/modules/policy/enums/policy.enum';
import { ExpertExpertiseUpdateValidation } from 'src/modules/user/decorators/user.common.decorator';
import { UpdateExpertiseRequestDto } from 'src/modules/user/dtos/request/user.update-expertise.dto';
import { ENUM_EXPERTISE_STATUS_CODE_ERROR } from 'src/modules/user/enums/user.status-code.enum';
import { UserParsePipe } from 'src/modules/user/pipes/user.parse.pipe';
import { UserDoc } from 'src/modules/user/repository/entities/user.entity';
import { UserService } from 'src/modules/user/services/user.service';
import { UserProtected } from 'src/modules/user/decorators/user.decorator';

@ApiTags('modules.shared.user')
@Controller({
    version: '1',
    path: '/',
})
export class UserExpertController {
    constructor(
        private readonly userService: UserService,
        private readonly categoryService: CategoryService
    ) {}

    // // region Update Expert Availability Time
    // @ExpertUpdateAvailabilityDoc()
    // @Response('expert.updateAvailabilitySuccess')
    // @ExpertAvailabilityUpdateValidation()
    // @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.EXPERT)
    // @AuthJwtAccessProtected()
    // @ApiKeyProtected()
    // @Put('availability/update')
    // async updateAvailability(
    //     @AuthJwtPayload<AuthJwtAccessPayloadDto>('_id', UserParsePipe)
    //     user: UserDoc,
    //     @Body()
    //     { ...body }: ExpertUpdateAvailabilityRequestDto
    // ): Promise<void> {
    //     await this.userService.updateAvailability(user, { ...body });
    //
    //     return;
    // }
    // // endregion

    // region Update Expertise
    @Response('expert.updateExpertiseSuccess')
    @ExpertExpertiseUpdateValidation()
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.EXPERT)
    @UserProtected()
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Put('expertise/update')
    async updateExpertise(
        @AuthJwtPayload<AuthJwtAccessPayloadDto>('user', UserParsePipe)
        user: UserDoc,
        @Body()
        { expertise }: UpdateExpertiseRequestDto
    ): Promise<void> {
        const validExpertise =
            await this.categoryService.filterValidExpertise(expertise);

        if (validExpertise.length === 0) {
            throw new NotFoundException({
                statusCode: ENUM_EXPERTISE_STATUS_CODE_ERROR.NOT_FOUND,
                message: 'expert.error.expertiseNotFound',
            });
        }
        // const promises: Promise<any>[] = [
        //     this.roleService.findOneById(role),
        //     this.userService.existByEmail(email),
        //     this.countryService.findOneById(country),
        // ];
        // const [checkRole, emailExist, checkCountry] =
        //     await Promise.all(promises);
        //
        // if (!checkRole) {
        //     throw new NotFoundException({
        //         statusCode: ENUM_ROLE_STATUS_CODE_ERROR.NOT_FOUND,
        //         message: 'role.error.notFound',
        //     });
        // } else if (!checkCountry) {
        //     throw new NotFoundException({
        //         statusCode: ENUM_COUNTRY_STATUS_CODE_ERROR.NOT_FOUND,
        //         message: 'country.error.notFound',
        //     });
        // } else if (emailExist) {
        //     throw new ConflictException({
        //         statusCode: ENUM_USER_STATUS_CODE_ERROR.EMAIL_EXIST,
        //         message: 'user.error.emailExist',
        //     });
        // }

        await this.userService.updateExpertise(user, {
            expertise: validExpertise,
        });

        return;
    }
    // endregion
}
