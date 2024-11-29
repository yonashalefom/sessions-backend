import { applyDecorators, UseGuards } from '@nestjs/common';

import { ValidationGuard } from 'src/common/validation/guards/validation.validator.guard';
import {
    createUserValidationSchema,
    expertExpertiseUpdateValidationSchema,
} from 'src/modules/user/validation/schemas/user.validation.schemas';

export function ExpertExpertiseUpdateValidation(): MethodDecorator {
    return applyDecorators(
        UseGuards(new ValidationGuard(expertExpertiseUpdateValidationSchema))
    );
}

export function CreateUserValidation(): MethodDecorator {
    return applyDecorators(
        UseGuards(new ValidationGuard(createUserValidationSchema))
    );
}
