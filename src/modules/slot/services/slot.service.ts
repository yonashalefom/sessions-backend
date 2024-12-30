import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
} from '@nestjs/common';
import moment from 'moment-timezone';
import { HelperDateService } from 'src/common/helper/services/helper.date.service';
import { HelperURLService } from 'src/common/helper/services/helper.url.service';
import { BookingDoc } from 'src/modules/booking/repository/entities/booking.entity';
import { BookingService } from 'src/modules/booking/services/booking.service';
import { EventDoc } from 'src/modules/events/repository/entities/event.entity';
import { EventService } from 'src/modules/events/services/event.service';
import { ScheduleAvailabilityEntity } from 'src/modules/schedules/repository/entities/schedule.availability.entity';
import { ScheduleService } from 'src/modules/schedules/services/schedule.service';
import { SlotDto } from 'src/modules/slot/dtos/response/slot.get.response.dto';
import { ENUM_SLOT_STATUS_CODE_ERROR } from 'src/modules/slot/enums/slot.status-code.enum';
import { ISlotService } from 'src/modules/slot/interfaces/slot.service.interface';
import { DateRange, DateRangeWithTimezone } from 'src/modules/slot/types/typs';

@Injectable()
export class SlotService implements ISlotService {
    constructor(
        private readonly scheduleService: ScheduleService,
        private readonly eventService: EventService,
        @Inject(forwardRef(() => BookingService))
        private readonly bookingService: BookingService,
        private readonly helperDateService: HelperDateService,
        private readonly helperURLService: HelperURLService
    ) {}

    // region Check If Requested Date Range Is Valid
    validateDateRange(userTimezone: string, start: Date, end: Date): DateRange {
        const today = this.helperDateService.create(
            undefined,
            {
                startOfDay: true,
            },
            userTimezone
        );
        const startDate = this.helperDateService.create(
            start,
            undefined,
            userTimezone
        );
        const endDate = this.helperDateService.create(
            end,
            undefined,
            userTimezone
        );

        if (
            this.helperDateService.isBefore(startDate, today) ||
            this.helperDateService.isBefore(endDate, today)
        ) {
            throw new BadRequestException({
                statusCode: ENUM_SLOT_STATUS_CODE_ERROR.DATE_LESS_THAN_TODAY,
                message: 'slot.error.dateLessThanToday',
            });
        }

        if (this.helperDateService.isBefore(endDate, startDate)) {
            throw new BadRequestException({
                statusCode:
                    ENUM_SLOT_STATUS_CODE_ERROR.END_DATE_LESS_THAN_START_DATE,
                message: 'slot.error.endDateLessThanStartDate',
            });
        }
        return { startDate, endDate };
    }
    // endregion

    // region Get Available Slots
    async getAvailableSlots(
        expertEvent: EventDoc,
        dateRange: DateRangeWithTimezone
    ): Promise<Record<string, SlotDto[]>> {
        const expertSchedules = await this.scheduleService.findAll({
            userId: expertEvent.owner,
            isActive: true,
        });

        const availableSlots = [];

        for (const expertSchedule of expertSchedules) {
            for (const expertAvailability of expertSchedule.availability) {
                const dailySlots = await this.generateEventSlots(
                    dateRange,
                    expertAvailability,
                    expertSchedule.timeZone,
                    expertEvent
                );
                availableSlots.push(...dailySlots);
            }
        }

        // Fetch all active bookings of the expert
        const bookings = await this.bookingService.findAll({
            expertId: expertEvent.owner,
            isActive: true,
        });

        // Filter slots that doesn't conflict with already booked slots
        let availableSlotsFiltered = availableSlots;
        if (bookings.length > 0) {
            availableSlotsFiltered = availableSlots.filter(slot => {
                const slotStart = moment(slot);
                const slotEnd = moment(slot).add(
                    expertEvent.duration,
                    'minutes'
                );

                return this.isSlotAvailable(slotStart, slotEnd, bookings);
            });
        }

        return this.groupSlotsByDate(
            availableSlotsFiltered,
            dateRange.userTimezone,
            expertEvent.duration
        );
    }

    // endregion

    // region Validate Slot is Valid for the Specified Slot
    isValidSlot(
        requestedStartTime: string,
        requestedEndTime: string,
        availableSlots: Record<string, SlotDto[]>
    ): boolean {
        const requestedStart = moment(requestedStartTime);
        const requestedEnd = moment(requestedEndTime);

        // Get the date key from the requested start time
        const dateKey = requestedStart.format('YYYY-MM-DD');

        // Check if slots exist for the requested date
        if (!availableSlots[dateKey]) {
            return false;
        }

        // Validate the requested time against the available slots
        return availableSlots[dateKey].some(slot => {
            const slotStart = moment(slot.startTime);
            const slotEnd = moment(slot.endTime);

            return (
                requestedStart.isSameOrAfter(slotStart) &&
                requestedEnd.isSameOrBefore(slotEnd)
            );
        });
    }

    // endregion

    // region Check if Slot is Available
    private isSlotAvailable(
        slotStart: moment.Moment,
        slotEnd: moment.Moment,
        bookings: BookingDoc[]
    ): boolean {
        return !bookings.some(booking => {
            const bookingStart = moment(booking.startTime);
            const bookingEnd = moment(booking.endTime);

            // Check if the slot overlaps with the booking
            return (
                slotStart.isBefore(bookingEnd) && slotEnd.isAfter(bookingStart)
            );
        });
    }
    // endregion

    // region Generate Time Slots for an Event
    private async generateEventSlots(
        dateRange: DateRangeWithTimezone,
        expertAvailability: ScheduleAvailabilityEntity,
        scheduleTimeZone: string,
        expertEvent: EventDoc
    ): Promise<string[]> {
        const {
            days: expertAvailDays,
            startTime: expertAvailStartTime,
            endTime: expertAvailEndTime,
        } = expertAvailability;

        const availableSlots = [];

        const startDateByUserTz = this.helperDateService.createMomentDate(
            dateRange.start,
            {
                startOfDay: true,
            },
            dateRange.userTimezone
        );
        const endDateByUserTz = this.helperDateService.createMomentDate(
            dateRange.end,
            {
                endOfDay: true,
            },
            dateRange.userTimezone
        );

        const currentTimeByUserTz = moment().tz(dateRange.userTimezone);
        while (startDateByUserTz.isBefore(endDateByUserTz)) {
            // Map ISO weekday number to day names
            if (expertAvailDays.includes(startDateByUserTz.isoWeekday())) {
                const slots = this.splitTimeIntoIntervals(
                    startDateByUserTz.format('YYYY-MM-DD'),
                    expertAvailStartTime,
                    expertAvailEndTime,
                    expertEvent.duration,
                    scheduleTimeZone
                );

                for (const slot of slots) {
                    const adjustedSlotStart = moment(slot)
                        .tz(dateRange.userTimezone)
                        .add(expertEvent.bookingOffsetMinutes, 'minutes');
                    if (adjustedSlotStart.isAfter(currentTimeByUserTz)) {
                        availableSlots.push(adjustedSlotStart.toISOString());
                    }
                }
            }

            startDateByUserTz.tz(dateRange.userTimezone).add(1, 'day');
        }

        return availableSlots;
    }

    // endregion

    // region Split Expert Availability Time Into Intervals
    private splitTimeIntoIntervals(
        currentDate: string,
        expertAvailStartTime: string,
        expertAvailEndTime: string,
        eventDuration: number,
        scheduleTimeZone: string
    ): string[] {
        const availStartTimeTZ = moment.tz(
            `${currentDate}T${expertAvailStartTime}`,
            scheduleTimeZone
        );
        const availEndTimeTZ = moment.tz(
            `${currentDate}T${expertAvailEndTime}`,
            scheduleTimeZone
        );

        const intervals = [];

        while (availStartTimeTZ.isBefore(availEndTimeTZ)) {
            intervals.push(availStartTimeTZ.utc().toISOString());

            availStartTimeTZ.add(eventDuration, 'minutes');
        }

        return intervals;
    }
    // endregion

    // region Group Slots By Date
    private groupSlotsByDate(
        slots: string[],
        userTimezone: string,
        eventDuration: number
    ): Record<string, SlotDto[]> {
        const groupedSlots: Record<string, SlotDto[]> = {};

        slots.forEach(slot => {
            const dateKey = moment(slot).tz(userTimezone).format('YYYY-MM-DD');
            if (!groupedSlots[dateKey]) {
                groupedSlots[dateKey] = [];
            }

            groupedSlots[dateKey].push({
                time: moment(slot).tz(userTimezone).toISOString(),
                timezone: userTimezone,
                startTime: moment(slot).tz(userTimezone).toISOString(),
                endTime: moment(slot)
                    .tz(userTimezone)
                    .add(eventDuration, 'minutes')
                    .toISOString(),
            });
        });

        return groupedSlots;
    }

    // endregion
}
