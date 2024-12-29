import {
    CountryDoc,
    CountryEntity,
} from 'src/modules/country/repository/entities/country.entity';
import { EventDoc } from 'src/modules/events/repository/entities/event.entity';
import { RoleEntity } from 'src/modules/role/repository/entities/role.entity';
import { IUserDoc } from 'src/modules/user/interfaces/user.interface';
import {
    UserMobileNumberDoc,
    UserMobileNumberEntity,
} from 'src/modules/user/repository/entities/embedded/user.mobile';
import { UserEntity } from 'src/modules/user/repository/entities/user.entity';

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

export interface IEventDoc extends Omit<EventDoc, 'owner'> {
    owner: UserEntity;
}

export interface IExpertsByCategoryDoc {
    expertiseCategoryId: string;
    expertiseCategory: string;
    expertiseDescription: string;
    users: [IUserDoc];
}
