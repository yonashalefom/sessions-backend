import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import moment, { ISO_8601 } from 'moment-timezone';
import {
    ENUM_HELPER_DATE_DIFF,
    ENUM_HELPER_DATE_FORMAT,
} from 'src/common/helper/enums/helper.enum';
import { IHelperDateService } from 'src/common/helper/interfaces/helper.date-service.interface';
import {
    IHelperDateSetTimeOptions,
    IHelperDateFormatOptions,
    IHelperDateDiffOptions,
    IHelperDateCreateOptions,
    IHelperDateForwardOptions,
    IHelperDateBackwardOptions,
    IHelperDateRoundDownOptions,
} from 'src/common/helper/interfaces/helper.interface';

@Injectable()
export class HelperDateService implements IHelperDateService {
    private readonly defTz: string;

    constructor(private readonly configService: ConfigService) {
        this.defTz = this.configService.get<string>('app.timezone');
    }

    calculateAge(dateOfBirth: Date, year?: number, tz = this.defTz): number {
        const m = moment().tz(tz);

        if (year) {
            m.set('year', year);
        }

        return m.diff(dateOfBirth, 'years');
    }

    diff(
        dateOne: Date,
        dateTwoMoreThanDateOne: Date,
        options?: IHelperDateDiffOptions,
        tz = this.defTz
    ): number {
        const mDateOne = moment(dateOne).tz(tz);
        const mDateTwo = moment(dateTwoMoreThanDateOne).tz(tz);
        const diff = moment.duration(mDateTwo.diff(mDateOne));

        if (options?.format === ENUM_HELPER_DATE_DIFF.MILIS) {
            return diff.asMilliseconds();
        } else if (options?.format === ENUM_HELPER_DATE_DIFF.SECONDS) {
            return diff.asSeconds();
        } else if (options?.format === ENUM_HELPER_DATE_DIFF.HOURS) {
            return diff.asHours();
        } else if (options?.format === ENUM_HELPER_DATE_DIFF.MINUTES) {
            return diff.asMinutes();
        } else {
            return diff.asDays();
        }
    }

    check(date: string | Date | number, tz = this.defTz): boolean {
        return moment(date, 'YYYY-MM-DD', true).tz(tz).isValid();
    }

    checkIso(date: string | Date | number, tz = this.defTz): boolean {
        return moment(date, ISO_8601, true).tz(tz).isValid();
    }

    checkTimestamp(timestamp: number, tz = this.defTz): boolean {
        return moment(timestamp, true).tz(tz).isValid();
    }

    create(
        date?: string | number | Date,
        options?: IHelperDateCreateOptions,
        tz = this.defTz
    ): Date {
        const mDate = moment(date ?? undefined).tz(tz);

        if (options?.startOfDay) {
            mDate.startOf('day');
        }

        return mDate.toDate();
    }

    createTimestamp(
        date?: string | number | Date,
        options?: IHelperDateCreateOptions,
        tz = this.defTz
    ): number {
        const mDate = moment(date ?? undefined).tz(tz);

        if (options?.startOfDay) {
            mDate.startOf('day');
        }

        return mDate.valueOf();
    }

    format(
        date: Date,
        options?: IHelperDateFormatOptions,
        tz = this.defTz
    ): string {
        if (options?.locale) {
            moment.locale(options.locale);
        }

        return moment(date)
            .tz(tz)
            .format(options?.format ?? ENUM_HELPER_DATE_FORMAT.DATE);
    }

    formatIsoDurationFromMinutes(minutes: number): string {
        return moment.duration(minutes, 'minutes').toISOString();
    }

    formatIsoDurationFromHours(hours: number): string {
        return moment.duration(hours, 'hours').toISOString();
    }

    formatIsoDurationFromDays(days: number): string {
        return moment.duration(days, 'days').toISOString();
    }

    forwardInSeconds(
        seconds: number,
        options?: IHelperDateForwardOptions,
        tz = this.defTz
    ): Date {
        return moment(options?.fromDate)
            .tz(tz)
            .add(seconds, 'seconds')
            .toDate();
    }

    backwardInSeconds(
        seconds: number,
        options?: IHelperDateBackwardOptions,
        tz = this.defTz
    ): Date {
        return moment(options?.fromDate)
            .tz(tz)
            .subtract(seconds, 'seconds')
            .toDate();
    }

    forwardInMinutes(
        minutes: number,
        options?: IHelperDateForwardOptions,
        tz = this.defTz
    ): Date {
        return moment(options?.fromDate)
            .tz(tz)
            .add(minutes, 'minutes')
            .toDate();
    }

    backwardInMinutes(
        minutes: number,
        options?: IHelperDateBackwardOptions,
        tz = this.defTz
    ): Date {
        return moment(options?.fromDate)
            .tz(tz)
            .subtract(minutes, 'minutes')
            .toDate();
    }

    forwardInHours(
        hours: number,
        options?: IHelperDateForwardOptions,
        tz = this.defTz
    ): Date {
        return moment(options?.fromDate).tz(tz).add(hours, 'hours').toDate();
    }

    backwardInHours(
        hours: number,
        options?: IHelperDateBackwardOptions,
        tz = this.defTz
    ): Date {
        return moment(options?.fromDate)
            .tz(tz)
            .subtract(hours, 'hours')
            .toDate();
    }

    forwardInDays(
        days: number,
        options?: IHelperDateForwardOptions,
        tz = this.defTz
    ): Date {
        return moment(options?.fromDate).tz(tz).add(days, 'd').toDate();
    }

    backwardInDays(
        days: number,
        options?: IHelperDateBackwardOptions,
        tz = this.defTz
    ): Date {
        return moment(options?.fromDate).tz(tz).subtract(days, 'days').toDate();
    }

    forwardInMonths(
        months: number,
        options?: IHelperDateForwardOptions,
        tz = this.defTz
    ): Date {
        return moment(options?.fromDate).tz(tz).add(months, 'months').toDate();
    }

    backwardInMonths(
        months: number,
        options?: IHelperDateBackwardOptions,
        tz = this.defTz
    ): Date {
        return moment(options?.fromDate)
            .tz(tz)
            .subtract(months, 'months')
            .toDate();
    }

    forwardInYears(
        years: number,
        options?: IHelperDateForwardOptions,
        tz = this.defTz
    ): Date {
        return moment(options?.fromDate).tz(tz).add(years, 'years').toDate();
    }

    backwardInYears(
        years: number,
        options?: IHelperDateBackwardOptions,
        tz = this.defTz
    ): Date {
        return moment(options?.fromDate)
            .tz(tz)
            .subtract(years, 'years')
            .toDate();
    }

    endOfMonth(date?: Date, tz = this.defTz): Date {
        return moment(date).tz(tz).endOf('month').toDate();
    }

    startOfMonth(date?: Date, tz = this.defTz): Date {
        return moment(date).tz(tz).startOf('month').toDate();
    }

    endOfYear(date?: Date, tz = this.defTz): Date {
        return moment(date).tz(tz).endOf('year').toDate();
    }

    startOfYear(date?: Date, tz = this.defTz): Date {
        return moment(date).tz(tz).startOf('year').toDate();
    }

    endOfDay(date?: Date, tz = this.defTz): Date {
        return moment(date).tz(tz).endOf('day').toDate();
    }

    startOfDay(date?: Date, tz = this.defTz): Date {
        return moment(date).tz(tz).startOf('day').toDate();
    }

    setTime(
        date: Date,
        { hour, minute, second, millisecond }: IHelperDateSetTimeOptions,
        tz = this.defTz
    ): Date {
        return moment(date)
            .tz(tz)
            .set({
                hour: hour,
                minute: minute,
                second: second,
                millisecond: millisecond,
            })
            .toDate();
    }

    addTime(
        date: Date,
        { hour, minute, second, millisecond }: IHelperDateSetTimeOptions,
        tz = this.defTz
    ): Date {
        return moment(date)
            .tz(tz)
            .add({
                hour: hour,
                minute: minute,
                second: second,
                millisecond: millisecond,
            })
            .toDate();
    }

    subtractTime(
        date: Date,
        { hour, minute, second }: IHelperDateSetTimeOptions,
        tz = this.defTz
    ): Date {
        return moment(date)
            .tz(tz)
            .subtract({
                hour: hour,
                minute: minute,
                second: second,
            })
            .toDate();
    }

    roundDown(
        date: Date,
        options?: IHelperDateRoundDownOptions,
        tz = this.defTz
    ): Date {
        const mDate = moment(date).tz(tz);

        if (options?.hour) {
            mDate.set({ hour: 0 });
        }

        if (options?.minute) {
            mDate.set({ minute: 0 });
        }

        if (options?.second) {
            mDate.set({ second: 0 });
        }

        if (options?.millisecond) {
            mDate.set({ millisecond: 0 });
        }

        return mDate.toDate();
    }

    toUTC(date: string, tz = this.defTz): string {
        return moment.tz(date, tz).utc().format();
    }

    timeToUTC(time: string, tz = this.defTz): string {
        return moment(time, 'HH:mm:ss').tz(tz).utc().format();
    }

    moment(date?: string | Date, tz = this.defTz): moment.Moment {
        return moment(date).tz(tz);
    }

    isBefore(
        startDate?: string | Date,
        endDate?: string | Date,
        tz = this.defTz
    ): boolean {
        return moment(startDate).tz(tz).isBefore(endDate);
    }
}
