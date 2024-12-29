import { applyDecorators, UseGuards } from '@nestjs/common';

import { ValidationGuard } from 'src/common/validation/guards/validation.validator.guard';
import { createEventValidationSchema } from 'src/modules/events/validation/schemas/event.validation.schemas';

export function CreateEventValidation(): MethodDecorator {
    return applyDecorators(
        UseGuards(new ValidationGuard(createEventValidationSchema))
    );
}
