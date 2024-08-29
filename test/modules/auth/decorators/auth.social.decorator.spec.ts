import { UseGuards } from '@nestjs/common';
import { AuthSocialGoogleProtected } from 'src/modules/auth/decorators/auth.social.decorator';
import { AuthSocialGoogleGuard } from 'src/modules/auth/guards/social/auth.social.google.guard';

jest.mock('@nestjs/common', () => ({
    ...jest.requireActual('@nestjs/common'),
    UseGuards: jest.fn(),
    SetMetadata: jest.fn(),
}));

describe('AuthSocialGuard Decorators', () => {
    it('AuthSocialGoogleProtected decorator should apply AuthSocialGoogleGuard', () => {
        const result = AuthSocialGoogleProtected();

        expect(result).toBeTruthy();
        expect(UseGuards).toHaveBeenCalledWith(AuthSocialGoogleGuard);
    });
});