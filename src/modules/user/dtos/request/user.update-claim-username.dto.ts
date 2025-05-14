import {
    IsAlphanumeric,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UserUpdateClaimUsernameRequestDto {
    username: string;
}
