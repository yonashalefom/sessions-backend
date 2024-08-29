import { applyDecorators, UseGuards } from '@nestjs/common';

import { ValidationGuard } from 'src/common/validation/guards/validation.validator.guard';
import { expertAvailabilityCreateValidationSchema } from 'src/modules/user/validation/schemas/user.validation.schemas';

export function ExpertAvailabilityCreateValidation(): MethodDecorator {
    return applyDecorators(
        UseGuards(new ValidationGuard(expertAvailabilityCreateValidationSchema))
    );
}
