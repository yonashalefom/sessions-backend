import { Injectable } from '@nestjs/common';
import {
    IDatabaseAggregateOptions,
    IDatabaseCreateOptions,
    IDatabaseDeleteManyOptions,
    IDatabaseExistOptions,
    IDatabaseFindAllAggregateOptions,
    IDatabaseFindAllOptions,
    IDatabaseGetTotalOptions,
    IDatabaseOptions,
    IDatabaseSaveOptions,
    IDatabaseUpdateOptions,
} from 'src/common/database/interfaces/database.interface';
import { HelperDateService } from 'src/common/helper/services/helper.date.service';
import { ConfigService } from '@nestjs/config';
import { PaginationListDto } from 'src/common/pagination/dtos/pagination.list.dto';
import { IPaginationOrder } from 'src/common/pagination/interfaces/pagination.interface';
import { PaginationService } from 'src/common/pagination/services/pagination.service';
import { IResponsePaging } from 'src/common/response/interfaces/response.interface';
import { IAuthPassword } from 'src/modules/auth/interfaces/auth.interface';
import { plainToInstance } from 'class-transformer';
import { Document, PipelineStage } from 'mongoose';
import { DatabaseQueryContain } from 'src/common/database/decorators/database.decorator';
import { ExpertUpdateAvailabilityRequestDto } from 'src/modules/user/dtos/request/user.update-availability.dto';
import { UpdateExpertiseRequestDto } from 'src/modules/user/dtos/request/user.update-expertise.dto';
import { ExpertsListByCategoryResponseDto } from 'src/modules/user/dtos/response/experts.list.by.category.response.dto';
import { IUserService } from 'src/modules/user/interfaces/user.service.interface';
import { UserAvailabilityEntity } from 'src/modules/user/repository/entities/embedded/user.availability';
import { UserRepository } from 'src/modules/user/repository/repositories/user.repository';
import {
    UserDoc,
    UserEntity,
} from 'src/modules/user/repository/entities/user.entity';
import {
    IExpertsByCategoryDoc,
    IUserDoc,
    IUserEntity,
} from 'src/modules/user/interfaces/user.interface';
import {
    ENUM_USER_SIGN_UP_FROM,
    ENUM_USER_STATUS,
} from 'src/modules/user/enums/user.enum';
import { UserCreateRequestDto } from 'src/modules/user/dtos/request/user.create.request.dto';
import { UserUpdatePasswordAttemptRequestDto } from 'src/modules/user/dtos/request/user.update-password-attempt.request.dto';
import { UserUpdateRequestDto } from 'src/modules/user/dtos/request/user.update.request.dto';
import { UserUpdateMobileNumberRequestDto } from 'src/modules/user/dtos/request/user.update-mobile-number.request.dto';
import { UserProfileResponseDto } from 'src/modules/user/dtos/response/user.profile.response.dto';
import { UserListResponseDto } from 'src/modules/user/dtos/response/user.list.response.dto';
import { UserShortResponseDto } from 'src/modules/user/dtos/response/user.short.response.dto';
import { UserGetResponseDto } from 'src/modules/user/dtos/response/user.get.response.dto';
import { AwsS3Dto } from 'src/modules/aws/dtos/aws.s3.dto';
import { HelperStringService } from 'src/common/helper/services/helper.string.service';
import { AuthSignUpRequestDto } from 'src/modules/auth/dtos/request/auth.sign-up.request.dto';
import { UserUpdateClaimUsernameRequestDto } from 'src/modules/user/dtos/request/user.update-claim-username.dto';
import { DatabaseSoftDeleteDto } from 'src/common/database/dtos/database.soft-delete.dto';
import { UserUpdateProfileRequestDto } from 'src/modules/user/dtos/request/user.update-profile.dto';

@Injectable()
export class UserService implements IUserService {
    private readonly usernamePrefix: string;
    private readonly usernamePattern: RegExp;
    private readonly uploadPath: string;

    constructor(
        private readonly userRepository: UserRepository,
        private readonly helperDateService: HelperDateService,
        private readonly configService: ConfigService,
        private readonly helperStringService: HelperStringService,
        private readonly paginationService: PaginationService
    ) {
        this.usernamePrefix = this.configService.get<string>(
            'user.usernamePrefix'
        );
        this.usernamePattern = this.configService.get<RegExp>(
            'user.usernamePattern'
        );
        this.uploadPath = this.configService.get<string>('user.uploadPath');
    }

    async findAll(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<UserDoc[]> {
        return this.userRepository.findAll<UserDoc>(find, options);
    }

    async findAllAggregate(
        pipeline: PipelineStage[],
        options?: IDatabaseFindAllAggregateOptions
    ): Promise<any[]> {
        return this.userRepository.findAllAggregate(pipeline, options);
    }

    async getTotal(
        find?: Record<string, any>,
        options?: IDatabaseGetTotalOptions
    ): Promise<number> {
        return this.userRepository.getTotal(find, options);
    }

    async getTotalAggregate(
        pipelines: PipelineStage[],
        options?: IDatabaseAggregateOptions
    ): Promise<number> {
        return this.userRepository.getTotalAggregate(pipelines, options);
    }

    async findOneById(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<UserDoc> {
        return this.userRepository.findOneById<UserDoc>(_id, options);
    }

    async findOne(
        find: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<UserDoc> {
        return this.userRepository.findOne<UserDoc>(find, options);
    }

    async findOneByEmail(
        email: string,
        options?: IDatabaseOptions
    ): Promise<UserDoc> {
        return this.userRepository.findOne<UserDoc>({ email }, options);
    }

    async findOneByMobileNumber(
        mobileNumber: string,
        options?: IDatabaseOptions
    ): Promise<UserDoc> {
        return this.userRepository.findOne<UserDoc>({ mobileNumber }, options);
    }

    async findAllWithRoleAndCountry(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<IUserDoc[]> {
        return this.userRepository.findAll<IUserDoc>(find, {
            ...options,
            join: true,
        });
    }

    async getAllExpertsGroupByExpertise(
        options: Partial<PaginationListDto>
    ): Promise<IResponsePaging<ExpertsListByCategoryResponseDto>> {
        const { _search, _limit, _offset, _order } = options;

        const find: Record<string, any> = {
            role: '16c4b7f3-0c6b-4a99-a560-3ee99c1b0730',
            ..._search,
        };

        // region Aggregation Pipeline
        const pipeline = [
            {
                $match: find,
            },
            {
                $unwind: {
                    path: '$expertise',
                    preserveNullAndEmptyArrays: false,
                },
            },
            {
                $lookup: {
                    from: 'Categories',
                    localField: 'expertise',
                    foreignField: '_id',
                    as: 'expertise',
                },
            },
            {
                $unwind: {
                    path: '$expertise',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $group: {
                    _id: '$expertise._id',
                    expertiseCategory: {
                        $first: '$expertise.category',
                    },
                    expertiseDescription: {
                        $first: '$expertise.description',
                    },
                    users: {
                        $push: '$$ROOT',
                    },
                },
            },
            {
                $addFields: {
                    userCount: {
                        $size: '$users',
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    expertiseCategoryId: '$_id',
                    expertiseCategory: 1,
                    expertiseDescription: 1,
                    users: 1,
                    userCount: 1, // Optionally include the userCount if you want it in the result
                },
            },
        ];
        // endregion

        const expertsByCategory = await this.findAllAggregate(pipeline, {
            paging: {
                limit: _limit,
                offset: _offset,
            },
            order: _order as IPaginationOrder,
        });

        const total: number = await this.getTotalAggregate(pipeline);
        const totalPage: number = this.paginationService.totalPage(
            total,
            _limit
        );

        const mapped = await this.mapExpertsByCategoryList(expertsByCategory);

        return {
            _pagination: { total, totalPage },
            data: mapped,
        };
    }

    async findOneWithRoleAndCountry(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<IUserDoc> {
        return this.userRepository.findOne<IUserDoc>(find, {
            ...options,
            join: true,
        });
    }

    async findOneWithRoleAndCountryById(
        _id: string,
        options?: IDatabaseFindAllOptions
    ): Promise<IUserDoc> {
        return this.userRepository.findOneById<IUserDoc>(_id, {
            ...options,
            join: true,
        });
    }

    async findAllActiveWithRoleAndCountry(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<IUserDoc[]> {
        return this.userRepository.findAll<IUserDoc>(
            { ...find, status: ENUM_USER_STATUS.ACTIVE },
            {
                ...options,
                join: this.userRepository._joinActive,
            }
        );
    }

    async getTotalActive(
        find?: Record<string, any>,
        options?: IDatabaseGetTotalOptions
    ): Promise<number> {
        return this.userRepository.getTotal(
            { ...find, status: ENUM_USER_STATUS.ACTIVE },
            {
                ...options,
                join: this.userRepository._joinActive,
            }
        );
    }

    async findOneActiveById(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<IUserDoc> {
        return this.userRepository.findOne<IUserDoc>(
            { _id, status: ENUM_USER_STATUS.ACTIVE },
            {
                ...options,
                join: this.userRepository._joinActive,
            }
        );
    }

    async findOneActiveByEmail(
        email: string,
        options?: IDatabaseOptions
    ): Promise<IUserDoc> {
        return this.userRepository.findOne<IUserDoc>(
            { email, status: ENUM_USER_STATUS.ACTIVE },
            {
                ...options,
                join: this.userRepository._joinActive,
            }
        );
    }

    async findOneActiveByMobileNumber(
        mobileNumber: string,
        options?: IDatabaseOptions
    ): Promise<IUserDoc> {
        return this.userRepository.findOne<IUserDoc>(
            {
                mobileNumber,
                status: ENUM_USER_STATUS.ACTIVE,
            },
            {
                ...options,
                join: this.userRepository._joinActive,
            }
        );
    }

    async create(
        { email, name, role, country }: UserCreateRequestDto,
        { passwordExpired, passwordHash, salt, passwordCreated }: IAuthPassword,
        signUpFrom: ENUM_USER_SIGN_UP_FROM,
        options?: IDatabaseCreateOptions
    ): Promise<UserDoc> {
        const username = await this.createRandomUsername();

        const create: UserEntity = new UserEntity();
        create.name = name;
        create.email = email;
        create.role = role;
        create.status = ENUM_USER_STATUS.ACTIVE;
        create.password = passwordHash;
        create.salt = salt;
        create.passwordExpired = passwordExpired;
        create.passwordCreated = passwordCreated;
        create.passwordAttempt = 0;
        create.signUpDate = this.helperDateService.create();
        create.signUpFrom = signUpFrom;
        create.country = country;
        create.username = username;

        return this.userRepository.create<UserEntity>(create, options);
    }

    async signUp(
        role: string,
        { email, name, country }: AuthSignUpRequestDto,
        { passwordExpired, passwordHash, salt, passwordCreated }: IAuthPassword,
        options?: IDatabaseCreateOptions
    ): Promise<UserDoc> {
        const username = await this.createRandomUsername();

        const create: UserEntity = new UserEntity();
        create.name = name;
        create.email = email;
        create.role = role;
        create.status = ENUM_USER_STATUS.ACTIVE;
        create.password = passwordHash;
        create.salt = salt;
        create.passwordExpired = passwordExpired;
        create.passwordCreated = passwordCreated;
        create.passwordAttempt = 0;
        create.signUpDate = this.helperDateService.create();
        create.signUpFrom = ENUM_USER_SIGN_UP_FROM.PUBLIC;
        create.country = country;
        create.username = username;

        return this.userRepository.create<UserEntity>(create, options);
    }

    async existByEmail(
        email: string,
        options?: IDatabaseExistOptions
    ): Promise<boolean> {
        return this.userRepository.exists(
            DatabaseQueryContain('email', email, { fullWord: true }),
            { ...options, withDeleted: true }
        );
    }

    async existByUsername(
        username: string,
        options?: IDatabaseExistOptions
    ): Promise<boolean> {
        return this.userRepository.exists(
            DatabaseQueryContain('username', username, { fullWord: true }),
            { ...options, withDeleted: true }
        );
    }

    async existByMobileNumber(
        mobileNumber: string,
        options?: IDatabaseExistOptions
    ): Promise<boolean> {
        return this.userRepository.exists(
            {
                mobileNumber,
            },
            { ...options, withDeleted: true }
        );
    }

    async updatePhoto(
        repository: UserDoc,
        photo: AwsS3Dto,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        repository.photo = photo;

        return this.userRepository.save(repository, options);
    }

    async updatePassword(
        repository: UserDoc,
        { passwordHash, passwordExpired, salt, passwordCreated }: IAuthPassword,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        repository.password = passwordHash;
        repository.passwordExpired = passwordExpired;
        repository.passwordCreated = passwordCreated;
        repository.salt = salt;

        return this.userRepository.save(repository, options);
    }

    async active(
        repository: UserDoc,
        options?: IDatabaseSaveOptions
    ): Promise<UserEntity> {
        repository.status = ENUM_USER_STATUS.ACTIVE;

        return this.userRepository.save(repository, options);
    }

    async inactive(
        repository: UserDoc,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        repository.status = ENUM_USER_STATUS.INACTIVE;

        return this.userRepository.save(repository, options);
    }

    async blocked(
        repository: UserDoc,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        repository.status = ENUM_USER_STATUS.BLOCKED;

        return this.userRepository.save(repository, options);
    }

    async updatePasswordAttempt(
        repository: UserDoc,
        { passwordAttempt }: UserUpdatePasswordAttemptRequestDto,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        repository.passwordAttempt = passwordAttempt;

        return this.userRepository.save(repository, options);
    }

    async increasePasswordAttempt(
        repository: UserDoc,
        options?: IDatabaseUpdateOptions
    ): Promise<UserDoc> {
        return this.userRepository.update(
            { _id: repository._id },
            {
                $inc: {
                    passwordAttempt: 1,
                },
            },
            options
        );
    }

    async resetPasswordAttempt(
        repository: UserDoc,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        repository.passwordAttempt = 0;

        return this.userRepository.save(repository, options);
    }

    async updatePasswordExpired(
        repository: UserDoc,
        passwordExpired: Date,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        repository.passwordExpired = passwordExpired;

        return this.userRepository.save(repository, options);
    }

    async update(
        repository: UserDoc,
        { country, name, role, availability }: UserUpdateRequestDto,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        repository.country = country;
        repository.name = name;
        repository.role = role;
        repository.availability = availability as UserAvailabilityEntity;

        return this.userRepository.save(repository, options);
    }

    async updateMobileNumber(
        repository: UserDoc,
        { country, number }: UserUpdateMobileNumberRequestDto,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        repository.mobileNumber = {
            country,
            number,
        };

        return this.userRepository.save(repository, options);
    }

    async updateClaimUsername(
        repository: UserDoc,
        { username }: UserUpdateClaimUsernameRequestDto,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        repository.username = username;

        return this.userRepository.save(repository, options);
    }

    async removeMobileNumber(
        repository: UserDoc,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        repository.mobileNumber = undefined;

        return this.userRepository.save(repository, options);
    }

    async delete(
        repository: UserDoc,
        dto: DatabaseSoftDeleteDto,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        return this.userRepository.softDelete(repository, dto, options);
    }

    async deleteMany(
        find: Record<string, any>,
        options?: IDatabaseDeleteManyOptions
    ): Promise<boolean> {
        try {
            await this.userRepository.deleteMany(find, options);

            return true;
        } catch (error: unknown) {
            throw error;
        }
    }

    async updateProfile(
        repository: UserDoc,
        { country, name, address }: UserUpdateProfileRequestDto,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        repository.country = country;
        repository.name = name;
        repository.address = address;

        return this.userRepository.save(repository, options);
    }

    async updateAvailability(
        repository: UserDoc,
        { availability }: ExpertUpdateAvailabilityRequestDto,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        repository.availability = availability as UserAvailabilityEntity;

        return this.userRepository.save(repository, options);
    }

    async updateExpertise(
        repository: UserDoc,
        { expertise }: UpdateExpertiseRequestDto,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        repository.expertise = expertise;

        return this.userRepository.save(repository, options);
    }

    async join(repository: UserDoc): Promise<IUserDoc> {
        return this.userRepository.join(repository, this.userRepository._join);
    }

    async getPhotoUploadPath(user: string): Promise<string> {
        return this.uploadPath.replace('{user}', user);
    }

    async createRandomFilenamePhoto(): Promise<string> {
        return this.helperStringService.random(10);
    }

    async createRandomUsername(): Promise<string> {
        const suffix = this.helperStringService.random(6);

        return `${this.usernamePrefix}-${suffix}`;
    }

    async checkUsername(username: string): Promise<boolean> {
        return username.search(this.usernamePattern) === -1;
    }

    async mapProfile(
        user: IUserDoc | IUserEntity
    ): Promise<UserProfileResponseDto> {
        return plainToInstance(
            UserProfileResponseDto,
            user instanceof Document ? user.toObject() : user
        );
    }

    async mapProfileShort(
        user: IUserDoc | IUserEntity
    ): Promise<UserListResponseDto> {
        return plainToInstance(
            UserListResponseDto,
            user instanceof Document ? user.toObject() : user
        );
    }

    async mapList(
        users: IUserDoc[] | IUserEntity[]
    ): Promise<UserListResponseDto[]> {
        return plainToInstance(
            UserListResponseDto,
            users.map((u: IUserDoc | IUserEntity) =>
                u instanceof Document ? u.toObject() : u
            )
        );
    }

    async mapExpertsByCategoryList(
        expertsByCategory: IExpertsByCategoryDoc[]
    ): Promise<ExpertsListByCategoryResponseDto[]> {
        return plainToInstance(
            ExpertsListByCategoryResponseDto,
            expertsByCategory.map((category: IExpertsByCategoryDoc) =>
                category instanceof Document ? category.toObject() : category
            )
        );
    }

    async mapShort(
        users: IUserDoc[] | IUserEntity[]
    ): Promise<UserShortResponseDto[]> {
        return plainToInstance(
            UserShortResponseDto,
            users.map((u: IUserDoc | IUserEntity) =>
                u instanceof Document ? u.toObject() : u
            )
        );
    }

    async mapGet(user: IUserDoc | IUserEntity): Promise<UserGetResponseDto> {
        return plainToInstance(
            UserGetResponseDto,
            user instanceof Document ? user.toObject() : user
        );
    }
}
