import moment from 'moment-timezone';

function normalizeTime(time: string, timeZone: string): string {
    // Assume the date is arbitrary (e.g., 1970-01-01) for time comparison
    return moment.tz(`1970-01-01T${time}`, timeZone).utc().format();
}

export const checkAvailabilityOverlap = (
    newAvailability,
    existingAvailability,
    newTimeZone: string,
    existingTimeZone: string
): boolean => {
    for (const existing of existingAvailability) {
        const newDays = new Set(newAvailability.days);
        const commonDays = existing.days.filter(day => newDays.has(day));

        if (commonDays.length > 0) {
            const newStartUTC = normalizeTime(
                newAvailability.startTime,
                newTimeZone
            );
            const newEndUTC = normalizeTime(
                newAvailability.endTime,
                newTimeZone
            );

            const existingStartUTC = normalizeTime(
                existing.startTime,
                existingTimeZone
            );
            const existingEndUTC = normalizeTime(
                existing.endTime,
                existingTimeZone
            );

            // console.log('newStartUTC: ' + newStartUTC);
            // console.log('newEndUTC: ' + newEndUTC);
            // console.log('existingStartUTC: ' + existingStartUTC);
            // console.log('existingEndUTC: ' + existingEndUTC);

            if (newStartUTC < existingEndUTC && newEndUTC > existingStartUTC) {
                return true; // Overlap detected
            }
        }
    }
    return false;
};

export const isSlotConflicted = (
    slot: string,
    eventStart: Date,
    duration: number
): boolean => {
    const slotStart = moment(slot);
    const slotEnd = slotStart.clone().add(duration, 'minutes');

    const eventStartMoment = moment(eventStart);
    const eventEndMoment = eventStartMoment.clone().add(duration, 'minutes');

    return (
        slotStart.isBetween(
            eventStartMoment,
            eventEndMoment,
            undefined,
            '[)'
        ) ||
        slotEnd.isBetween(eventStartMoment, eventEndMoment, undefined, '(]')
    );
};

export const splitTimeIntoIntervals = (
    startDate: string, // E.g., "2024-01-01"
    endDate: string, // E.g., "2024-01-02"
    startTime: string, // E.g., "09:00:00"
    endTime: string, // E.g., "17:00:00"
    intervalMinutes: number,
    timeZone: string
): string[] => {
    const intervals = [];
    let current = moment.tz(`${startDate}T${startTime}`, timeZone); // Start from the provided date
    const endOfDay = moment.tz(`${startDate}T${endTime}`, timeZone);

    while (current.isBefore(moment.tz(`${endDate}T${endTime}`, timeZone))) {
        if (current.isBefore(endOfDay)) {
            intervals.push(current.utc().format()); // Add to intervals in UTC
            current.add(intervalMinutes, 'minutes');
        } else {
            // Move to the next day and reset to startTime
            current = moment.tz(
                `${current.clone().add(1, 'day').format('YYYY-MM-DD')}T${startTime}`,
                timeZone
            );
        }
    }
    return intervals;
};
