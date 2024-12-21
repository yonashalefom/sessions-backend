import moment from 'moment-timezone';

export const customTimeValidator = (value, helpers) => {
    if (!moment(value, 'HH:mm:ss', true).isValid()) {
        return helpers.message(
            'Time must be in the format HH:mm:ss (24-hour clock).'
        );
    }
    return value;
};

export const customTimeZoneValidator = (value, helpers) => {
    if (!moment.tz.names().includes(value)) {
        return helpers.message({ custom: 'Invalid time zone.' });
    }
    return value;
};
