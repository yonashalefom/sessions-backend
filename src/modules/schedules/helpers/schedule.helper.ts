import moment from 'moment-timezone';

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
