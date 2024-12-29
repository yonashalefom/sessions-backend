import { applyDecorators, UseGuards } from '@nestjs/common';

import { ValidationGuard } from 'src/common/validation/guards/validation.validator.guard';
import {
    cancelMeetingValidationSchema,
    createMeetingValidationSchema,
} from 'src/modules/meeting/validation/schemas/meeting.validation.schemas';

export function CreateMeetingValidation(): MethodDecorator {
    return applyDecorators(
        UseGuards(new ValidationGuard(createMeetingValidationSchema))
    );
}

export function CancelMeetingValidation(): MethodDecorator {
    return applyDecorators(
        UseGuards(new ValidationGuard(cancelMeetingValidationSchema))
    );
}
