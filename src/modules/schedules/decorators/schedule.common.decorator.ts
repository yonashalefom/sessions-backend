import { applyDecorators, UseGuards } from '@nestjs/common';

import { ValidationGuard } from 'src/common/validation/guards/validation.validator.guard';
import { createScheduleValidationSchema } from 'src/modules/schedules/validation/schemas/schedule.validation.schemas';

export function CreateScheduleValidation(): MethodDecorator {
    return applyDecorators(
        UseGuards(new ValidationGuard(createScheduleValidationSchema))
    );
}
