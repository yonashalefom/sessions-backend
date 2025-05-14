import { applyDecorators, UseGuards } from '@nestjs/common';

import { ValidationGuard } from 'src/common/validation/guards/validation.validator.guard';
import {
    createUserValidationSchema,
    expertExpertiseUpdateValidationSchema,
    updateMobileNumberValidationSchema,
    updateUsernameValidationSchema,
    userInterestsUpdateValidationSchema,
} from 'src/modules/user/validation/schemas/user.validation.schemas';

export function ExpertExpertiseUpdateValidation(): MethodDecorator {
    return applyDecorators(
        UseGuards(new ValidationGuard(expertExpertiseUpdateValidationSchema))
    );
}

export function UserInterestsUpdateValidation(): MethodDecorator {
    return applyDecorators(
        UseGuards(new ValidationGuard(userInterestsUpdateValidationSchema))
    );
}

export function CreateUserValidation(): MethodDecorator {
    return applyDecorators(
        UseGuards(new ValidationGuard(createUserValidationSchema))
    );
}

export function UpdateMobileNumberValidation(): MethodDecorator {
    return applyDecorators(
        UseGuards(new ValidationGuard(updateMobileNumberValidationSchema))
    );
}

export function UpdateUsernameValidation(): MethodDecorator {
    return applyDecorators(
        UseGuards(new ValidationGuard(updateUsernameValidationSchema))
    );
}
