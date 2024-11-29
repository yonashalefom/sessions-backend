import { Exclude, Type } from 'class-transformer';
import {
    ENUM_USER_GENDER,
    ENUM_USER_SIGN_UP_FROM,
    ENUM_USER_STATUS,
} from 'src/modules/user/enums/user.enum';
import { UserUpdateMobileNumberRequestDto } from 'src/modules/user/dtos/request/user.update-mobile-number.request.dto';
import { DatabaseDto } from 'src/common/database/dtos/database.dto';
import { AwsS3Dto } from 'src/modules/aws/dtos/aws.s3.dto';

export class UserGetResponseDto extends DatabaseDto {
    name: string;

    username: string;

    @Type(() => UserUpdateMobileNumberRequestDto)
    mobileNumber?: UserUpdateMobileNumberRequestDto;

    email: string;

    role: string;

    @Exclude()
    password: string;

    passwordExpired: Date;

    passwordCreated: Date;

    @Exclude()
    passwordAttempt: number;

    signUpDate: Date;

    signUpFrom: ENUM_USER_SIGN_UP_FROM;

    @Exclude()
    salt: string;

    status: ENUM_USER_STATUS;

    @Type(() => AwsS3Dto)
    photo?: AwsS3Dto;

    gender?: ENUM_USER_GENDER;

    country: string;

    address?: string;
}
