import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthSocialGoogleGuard } from 'src/modules/auth/guards/social/auth.social.google.guard';

export function AuthSocialGoogleProtected(): MethodDecorator {
    return applyDecorators(UseGuards(AuthSocialGoogleGuard));
}
