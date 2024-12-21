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

// region Expert Expertise Update Validation Schema
export const expertExpertiseUpdateValidationSchema = Joi.object({
    expertise: Joi.array()
        .items(Joi.string().uuid().required())
        .unique()
        .max(15)
        .required()
        .messages({
            'array.base': 'expertise must be an array.',
            'array.includesRequiredUnknowns':
                'At least one valid expertise is required.',
        }),
});
// endregion

// region Create Event Validation Schema
export const createScheduleValidationSchema = Joi.object({
    title: Joi.string()
        // .valid(
        //     ENUM_EVENT_TITLE.MINUTES_15,
        //     ENUM_EVENT_TITLE.MINUTES_30,
        //     ENUM_EVENT_TITLE.MINUTES_45,
        //     ENUM_EVENT_TITLE.MINUTES_60
        // )
        .required()
        .messages({
            'any.required': 'title is required.',
            // 'any.only':
            //     'title must be one of [15 MINUTES, 30 MINUTES, 45 MINUTES, 60 MINUTES].',
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
    // description: Joi.string().optional().max(500),
    // price: Joi.number().integer().min(0).max(25000).required().messages({
    //     'number.base': 'price must be a number.',
    //     'number.integer': 'price must be an integer.',
    //     'number.min': 'price must be at least 0.',
    //     'number.max': 'price must be less than or equal to 1,000,000.',
    //     'any.required': 'price is required.',
    // }),
    // duration: Joi.number()
    //     .integer()
    //     .required()
    //     .when('title', {
    //         is: ENUM_EVENT_TITLE.MINUTES_15,
    //         then: Joi.valid(ENUM_EVENT_DURATION_MINUTES.MINUTES_15).messages({
    //             'any.only': 'duration must be 15',
    //         }),
    //     })
    //     .when('title', {
    //         is: ENUM_EVENT_TITLE.MINUTES_30,
    //         then: Joi.valid(ENUM_EVENT_DURATION_MINUTES.MINUTES_30).messages({
    //             'any.only': 'duration must be 30',
    //         }),
    //     })
    //     .when('title', {
    //         is: ENUM_EVENT_TITLE.MINUTES_45,
    //         then: Joi.valid(ENUM_EVENT_DURATION_MINUTES.MINUTES_45).messages({
    //             'any.only': 'duration must be 45',
    //         }),
    //     })
    //     .when('title', {
    //         is: ENUM_EVENT_TITLE.MINUTES_60,
    //         then: Joi.valid(ENUM_EVENT_DURATION_MINUTES.MINUTES_60).messages({
    //             'any.only': 'duration must be 60',
    //         }),
    //     })
    //     .messages({
    //         'number.base': 'duration must be a number.',
    //         'number.integer': 'duration must be an integer.',
    //         'any.required': 'duration is required.',
    //     }),
    // role: Joi.string().uuid().required(),
    // name: Joi.string().required().min(1).max(100),
    // country: Joi.string().uuid().required(),
});
// endregion
