import { applyDecorators, UseGuards } from '@nestjs/common';

import { ValidationGuard } from 'src/common/validation/guards/validation.validator.guard';
import {
    createUserValidationSchema,
    expertAvailabilityUpdateValidationSchema,
    expertExpertiseUpdateValidationSchema,
} from 'src/modules/user/validation/schemas/user.validation.schemas';

export function ExpertAvailabilityUpdateValidation(): MethodDecorator {
    return applyDecorators(
        UseGuards(new ValidationGuard(expertAvailabilityUpdateValidationSchema))
    );
}

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
