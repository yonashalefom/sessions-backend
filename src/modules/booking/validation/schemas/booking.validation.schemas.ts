import Joi from 'joi';
import { ENUM_EVENT_TITLE } from 'src/modules/events/enums/event.enum';

// region Expert Availability Update Validation Schema
export const expertAvailabilityUpdateValidationSchema = Joi.object({
    availability: Joi.object({
        availabilityTimeslots: Joi.array()
            .items(
                Joi.object({
                    timeslot: Joi.string()
                        .valid(
                            ENUM_EVENT_TITLE.MINUTES_15,
                            ENUM_EVENT_TITLE.MINUTES_30,
                            ENUM_EVENT_TITLE.MINUTES_45,
                            ENUM_EVENT_TITLE.MINUTES_60
                        )
                        .required()
                        .messages({
                            'any.required': 'timeslot is required.',
                            'any.only':
                                'timeslot must be one of [MINUTES_15, MINUTES_30, MINUTES_45, MINUTES_60].',
                        }),
                    price: Joi.number()
                        .integer()
                        .min(0)
                        .max(1000000)
                        .required()
                        .messages({
                            'number.base': 'price must be a number.',
                            'number.integer': 'price must be an integer.',
                            'number.min': 'price must be at least 1.',
                            'number.max':
                                'price must be less than or equal to 1,000,000.',
                            'any.required': 'price is required.',
                        }),
                })
            )
            .required()
            .messages({
                'array.base': 'availabilityTimeslots must be an array.',
                'array.includesRequiredUnknowns':
                    'At least one valid timeslot object is required.',
            }),
        availabilityDates: Joi.array()
            .items(
                Joi.date()
                    .iso()
                    .greater('now')
                    .custom((value, helpers) => {
                        const today = new Date();
                        const maxDate = new Date();
                        maxDate.setMonth(today.getMonth() + 3); // Add 3 months to today's date

                        if (value > maxDate) {
                            return helpers.message({
                                'string.base': `Date must be within 3 months from today`,
                            });
                        }
                        return value;
                    })
                    .required()
                    .messages({
                        'date.base': 'availabilityDates must be a valid dates.',
                        'date.greater':
                            'availabilityDates cannot be in the past.',
                        'any.required': 'availabilityDates is required.',
                    })
            )
            .unique()
            .required()
            .messages({
                'array.base': 'availabilityDates must be an array of dates.',
                'array.unique':
                    'availabilityDates must not contain duplicate dates.',
            }),
    })
        .required()
        .messages({
            'object.base': 'availability must be an object.',
            'any.required': 'availability is required.',
        }),
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

// region Create Booking Validation Schema
export const createBookingValidationSchema = Joi.object({
    // startTime: Joi.string()
    //     .valid(
    //         ENUM_EVENT_TITLE.MINUTES_15,
    //         ENUM_EVENT_TITLE.MINUTES_30,
    //         ENUM_EVENT_TITLE.MINUTES_45,
    //         ENUM_EVENT_TITLE.MINUTES_60
    //     )
    //     .required()
    //     .messages({
    //         'any.required': 'title is required.',
    //         'any.only':
    //             'title must be one of [15 MINUTES, 30 MINUTES, 45 MINUTES, 60 MINUTES].',
    //     }),
    eventId: Joi.string().uuid().messages({
        'any.required': 'Event ID is required',
        'string.empty': 'Event ID cannot be empty',
    }),
    startTime: Joi.string().isoDate().required().messages({
        'any.required': 'Start time is required',
        'string.isoDate': 'Start time must be a valid ISO8601 date string',
    }),
    // endTime: Joi.string().isoDate().required().messages({
    //     'any.required': 'End time is required',
    //     'string.isoDate': 'End time must be a valid ISO8601 date string',
    // }),
    // bookingRefType: Joi.string()
    //     .valid(
    //         ENUM_BOOKING_REF_TYPE.IN_APP_MEETING,
    //         ENUM_BOOKING_REF_TYPE.EXTERNAL_MEETING
    //     )
    //     .optional()
    //     .messages({
    //         'string.empty': 'Booking reference type cannot be empty',
    //         'any.only': `Booking reference type must be either ${ENUM_BOOKING_REF_TYPE.IN_APP_MEETING} or ${ENUM_BOOKING_REF_TYPE.EXTERNAL_MEETING}`,
    //     }),
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
