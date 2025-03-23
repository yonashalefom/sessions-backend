import {
    CountryDoc,
    CountryEntity,
} from 'src/modules/country/repository/entities/country.entity';
import {
    RoleDoc,
    RoleEntity,
} from 'src/modules/role/repository/entities/role.entity';
import {
    UserDoc,
    UserEntity,
} from 'src/modules/user/repository/entities/user.entity';
import {
    UserMobileNumberDoc,
    UserMobileNumberEntity,
} from 'src/modules/user/repository/entities/user.mobile-number.entity';

export interface IUserMobileNumberEntity
    extends Omit<UserMobileNumberEntity, 'country'> {
    country: CountryEntity;
}

export interface IUserMobileNumberDoc
    extends Omit<UserMobileNumberDoc, 'country'> {
    country: CountryDoc;
}

export interface IUserEntity
    extends Omit<UserEntity, 'role' | 'country' | 'mobileNumber'> {
    role: RoleEntity;
    county: CountryEntity;
    mobileNumber?: IUserMobileNumberEntity;
}

export interface IUserDoc
    extends Omit<UserDoc, 'role' | 'country' | 'mobileNumber'> {
    role: RoleDoc;
    country: CountryDoc;
    mobileNumber?: IUserMobileNumberDoc;
}

export interface IExpertsByCategoryDoc {
    expertiseCategoryId: string;
    expertiseCategory: string;
    expertiseDescription: string;
    users: [IUserDoc];
}
