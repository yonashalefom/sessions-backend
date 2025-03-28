import { applyDecorators, UseGuards } from '@nestjs/common';

import { ValidationGuard } from 'src/common/validation/guards/validation.validator.guard';
import {
    cancelBookingValidationSchema,
    createBookingValidationSchema,
} from 'src/modules/booking/validation/schemas/booking.validation.schemas';

export function CreateBookingValidation(): MethodDecorator {
    return applyDecorators(
        UseGuards(new ValidationGuard(createBookingValidationSchema))
    );
}

export function CancelBookingValidation(): MethodDecorator {
    return applyDecorators(
        UseGuards(new ValidationGuard(cancelBookingValidationSchema))
    );
}
