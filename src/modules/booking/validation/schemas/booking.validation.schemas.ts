import Joi from 'joi';

// region Create Booking Validation Schema
export const createBookingValidationSchema = Joi.object({
    eventId: Joi.string().uuid().messages({
        'any.required': 'Event ID is required',
        'string.empty': 'Event ID cannot be empty',
    }),
    startTime: Joi.string().isoDate().required().messages({
        'any.required': 'Start time is required',
        'string.isoDate': 'Start time must be a valid ISO8601 date string',
    }),
});
// endregion

// region Cancel Booking Validation Schema
export const cancelBookingValidationSchema = Joi.object({
    cancellationReason: Joi.string().optional().max(500),
});
// endregion
