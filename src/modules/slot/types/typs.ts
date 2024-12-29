export interface DateRangeWithTimezone {
    start: Date;
    end: Date;
    userTimezone: string;
}

export interface DateRangeShort {
    start: Date;
    end: Date;
}

export interface DateRange {
    startDate: Date;
    endDate: Date;
}
