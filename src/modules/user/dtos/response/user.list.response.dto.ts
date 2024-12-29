import { OmitType } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { CountryShortResponseDto } from 'src/modules/country/dtos/response/country.short.response.dto';
import { RoleShortResponseDto } from 'src/modules/role/dtos/response/role.get.response.dto';
import {
    ENUM_USER_GENDER,
    ENUM_USER_SIGN_UP_FROM,
} from 'src/modules/user/enums/user.enum';
import { UserUpdateMobileNumberRequestDto } from 'src/modules/user/dtos/request/user.update-mobile-number.request.dto';
import { UserGetResponseDto } from 'src/modules/user/dtos/response/user.get.response.dto';

export class UserListResponseDto extends OmitType(UserGetResponseDto, [
    'passwordExpired',
    'passwordCreated',
    'signUpDate',
    'signUpFrom',
    'gender',
    'role',
    'country',
    'mobileNumber',
    'address',
] as const) {
    @Type(() => RoleShortResponseDto)
    role: RoleShortResponseDto;

    @Type(() => CountryShortResponseDto)
    country: CountryShortResponseDto;

    @Exclude()
    mobileNumber?: UserUpdateMobileNumberRequestDto;

    @Exclude()
    passwordExpired: Date;

    @Exclude()
    passwordCreated: Date;

    @Exclude()
    signUpDate: Date;

    @Exclude()
    signUpFrom: ENUM_USER_SIGN_UP_FROM;

    @Exclude()
    gender?: ENUM_USER_GENDER;

    @Exclude()
    address?: string;
}
