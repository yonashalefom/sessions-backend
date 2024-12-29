import Joi from 'joi';

// region Create Meeting Validation Schema
export const createMeetingValidationSchema = Joi.object({
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

// region Create Meeting Validation Schema
export const cancelMeetingValidationSchema = Joi.object({
    cancellationReason: Joi.string().optional().max(500),
});
// endregion
