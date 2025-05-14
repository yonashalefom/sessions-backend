import { isValidPhoneNumber } from 'libphonenumber-js';
import Joi, { CustomHelpers } from 'joi';

type CountryCodes = 'ET' | 'US';

export class GlobalValidationHelperClass {
    joiPhoneNumberValidator = (
        value,
        helpers: CustomHelpers
    ): Joi.ErrorReport => {
        if (!isValidPhoneNumber(value, 'ET')) {
            return helpers.error('any.invalid');
        }

        return value;
    };
}
