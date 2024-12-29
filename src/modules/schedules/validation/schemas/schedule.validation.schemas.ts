import Joi from 'joi';
import moment from 'moment-timezone';
import {
    customTimeValidator,
    customTimeZoneValidator,
} from 'src/common/validation/validators/common.validation.schemas';

// region Availability Validation Schema
export const availabilityValidationSchema = Joi.object({
    days: Joi.array()
        .items(
            Joi.number().integer().min(1).max(7).required().messages({
                'number.base': 'days must be a number.',
                'number.integer': 'days must be an integer.',
                'number.min': 'days must be at least 1.',
                'number.max': 'days must be less than or equal to 7',
                'any.required': 'days are required.',
            })
        )
        .unique()
        .min(1)
        .max(7)
        .required()
        .messages({
            'array.base': 'availabilityTimeslots must be an array.',
            'array.includesRequiredUnknowns':
                'At least one valid timeslot object is required.',
        }),
    startTime: Joi.string().custom(customTimeValidator).required(),
    endTime: Joi.string().custom(customTimeValidator).required(),
})
    .required()
    .messages({
        'object.base': 'availability must be an object.',
        'any.required': 'availability is required.',
    })
    .custom((value, helpers) => {
        const startTime = moment(value.startTime, 'HH:mm');
        const endTime = moment(value.endTime, 'HH:mm');
        if (startTime.isSameOrAfter(endTime)) {
            return helpers.message({
                custom: 'endTime must be greater than startTime.',
            });
        }
        if (endTime.diff(startTime, 'minutes') < 15) {
            return helpers.message({
                custom: 'endTime must be at least 15 minutes after startTime.',
            });
        }
        if (
            startTime.isBefore(moment('00:00', 'HH:mm')) ||
            endTime.isAfter(moment('23:59', 'HH:mm'))
        ) {
            return helpers.message({
                custom: 'Time must be within the range of 00:00 to 23:59.',
            });
        }
        return value;
    });
// endregion

// region Create Schedule Validation Schema
export const createScheduleValidationSchema = Joi.object({
    title: Joi.string().required().messages({
        'any.required': 'title is required.',
    }),
    timeZone: Joi.string().custom(customTimeZoneValidator).required().messages({
        'any.required': 'Time zone is required.',
        'string.base': 'Time zone must be a string.',
        custom: 'Invalid time zone.',
    }),
    availability: Joi.array()
        .items(availabilityValidationSchema)
        .unique()
        .max(15)
        .required()
        .messages({
            'array.base': 'availability must be an array.',
            'array.includesRequiredUnknowns':
                'At least one valid availability is required.',
        }),
});
// endregion
