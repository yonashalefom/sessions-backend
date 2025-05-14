import Joi from 'joi';
import { GlobalValidationHelperClass } from 'src/common/helper/global/global.validation.helper';

const globalValidationHelperClass = new GlobalValidationHelperClass();

// // region Expert Availability Update Validation Schema
// export const expertAvailabilityUpdateValidationSchema = Joi.object({
//     availability: Joi.object({
//         availabilityTimeslots: Joi.array()
//             .items(
//                 Joi.object({
//                     timeslot: Joi.string()
//                         .valid(
//                             ENUM_USER_AVAILABILITY_TIMESLOTS.MINUTES_15,
//                             ENUM_USER_AVAILABILITY_TIMESLOTS.MINUTES_30,
//                             ENUM_USER_AVAILABILITY_TIMESLOTS.MINUTES_45,
//                             ENUM_USER_AVAILABILITY_TIMESLOTS.MINUTES_60
//                         )
//                         .required()
//                         .messages({
//                             'any.required': 'timeslot is required.',
//                             'any.only':
//                                 'timeslot must be one of [MINUTES_15, MINUTES_30, MINUTES_45, MINUTES_60].',
//                         }),
//                     price: Joi.number()
//                         .integer()
//                         .min(0)
//                         .max(1000000)
//                         .required()
//                         .messages({
//                             'number.base': 'price must be a number.',
//                             'number.integer': 'price must be an integer.',
//                             'number.min': 'price must be at least 1.',
//                             'number.max':
//                                 'price must be less than or equal to 1,000,000.',
//                             'any.required': 'price is required.',
//                         }),
//                 })
//             )
//             .required()
//             .messages({
//                 'array.base': 'availabilityTimeslots must be an array.',
//                 'array.includesRequiredUnknowns':
//                     'At least one valid timeslot object is required.',
//             }),
//         availabilityDates: Joi.array()
//             .items(
//                 Joi.date()
//                     .iso()
//                     .greater('now')
//                     .custom((value, helpers) => {
//                         const today = new Date();
//                         const maxDate = new Date();
//                         maxDate.setMonth(today.getMonth() + 3); // Add 3 months to today's date
//
//                         if (value > maxDate) {
//                             return helpers.message({
//                                 'string.base': `Date must be within 3 months from today`,
//                             });
//                         }
//                         return value;
//                     })
//                     .required()
//                     .messages({
//                         'date.base': 'availabilityDates must be a valid dates.',
//                         'date.greater':
//                             'availabilityDates cannot be in the past.',
//                         'any.required': 'availabilityDates is required.',
//                     })
//             )
//             .unique()
//             .required()
//             .messages({
//                 'array.base': 'availabilityDates must be an array of dates.',
//                 'array.unique':
//                     'availabilityDates must not contain duplicate dates.',
//             }),
//     })
//         .required()
//         .messages({
//             'object.base': 'availability must be an object.',
//             'any.required': 'availability is required.',
//         }),
// });
// // endregion

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

export const userInterestsUpdateValidationSchema = Joi.object({
    interests: Joi.array()
        .items(Joi.string().uuid().required())
        .unique()
        .max(15)
        .required()
        .messages({
            'array.base': 'Interests must be an array.',
            'array.includesRequiredUnknowns':
                'At least one valid interest is required.',
        }),
});
// endregion

// region Create User Schema (For Admin)
export const createUserValidationSchema = Joi.object({
    email: Joi.string().email().required().max(100),
    role: Joi.string().uuid().required(),
    name: Joi.string().required().min(1).max(100),
    country: Joi.string().uuid().required(),
});
// endregion

// region Update Phone Number Schema
export const updateMobileNumberValidationSchema = Joi.object({
    country: Joi.string()
        .required()
        .uuid()
        .message('Please specify a valid country'),
    number: Joi.string().min(4).max(100).required(),
})
    .required()
    .messages({ 'any.required': 'Please provide a valid phone number.' });
// endregion

// region Update Username Schema
export const updateUsernameValidationSchema = Joi.object({
    username: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-Z0-9_.]+$/)
        .messages({
            'string.empty': 'Username cannot be empty',
            'string.min': 'Username should have at least {#limit} characters',
            'string.max': 'Username should not exceed {#limit} characters',
            'string.pattern.base':
                'Username can only contain letters, numbers, underscores, and periods',
        })
        .required()
        .messages({
            'any.required': 'Username is required',
        }),
})
    .required()
    .messages({ 'any.required': 'Please provide a valid phone number.' });
// endregion
