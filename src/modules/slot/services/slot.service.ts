import { Injectable } from '@nestjs/common';
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
import { ISlotService } from 'src/modules/slot/interfaces/slot.service.interface';
import { DateRangeWithTimezone } from 'src/modules/slot/types/typs';

@Injectable()
export class SlotService implements ISlotService {
    constructor(
        private readonly scheduleService: ScheduleService,
        private readonly eventService: EventService,
        private readonly bookingService: BookingService,
        private readonly helperDateService: HelperDateService,
        private readonly helperURLService: HelperURLService
    ) {}

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

        console.log(JSON.stringify(availableSlots, null, 2));
        // Fetch all active bookings for the expert
        const bookings = await this.bookingService.findAll({
            expertId: expertEvent.owner,
            isActive: true,
        });

        // Filter slots to find available ones
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

    // region Generate Time Slots for an Event
    private async generateEventSlots(
        dateRange: DateRangeWithTimezone,
        expertAvailability: ScheduleAvailabilityEntity,
        scheduleTimeZone: string,
        expertEvent: EventDoc
    ): Promise<string[]> {
        const { days, startTime, endTime } = expertAvailability;

        const availableSlots = [];

        const startDateByUserTimezone = moment(dateRange.start)
            .tz(dateRange.userTimezone)
            .startOf('day');
        const endDateByUserTimezone = moment(dateRange.end)
            .tz(dateRange.userTimezone)
            .endOf('day');

        const currentTime = moment().tz(scheduleTimeZone);

        while (startDateByUserTimezone.isBefore(endDateByUserTimezone)) {
            if (days.includes(startDateByUserTimezone.isoWeekday())) {
                const slots = this.splitTimeIntoIntervals(
                    startDateByUserTimezone.format('YYYY-MM-DD'),
                    startTime,
                    endTime,
                    expertEvent.duration,
                    scheduleTimeZone
                );

                for (const slot of slots) {
                    const adjustedSlotStart = moment(slot).add(
                        expertEvent.bookingOffsetMinutes,
                        'minutes'
                    );

                    // if (!this.isSlotConflicted(adjustedSlotStart, expertEvent)) {
                    if (
                        adjustedSlotStart.isAfter(currentTime)
                        // &&
                        // !(await this.isSlotConflicted(
                        //     adjustedSlotStart,
                        //     expertEvent
                        // ))
                    ) {
                        availableSlots.push(adjustedSlotStart.toISOString());
                    }
                    // }
                }
            }

            startDateByUserTimezone.add(1, 'day');
        }

        return availableSlots;
    }

    // endregion

    // region Split Expert Availability Time Into Intervals
    private splitTimeIntoIntervals(
        date: string,
        availStartTime: string,
        availEndTime: string,
        eventDuration: number,
        scheduleTimeZone: string
    ): string[] {
        const availStartTimeTZ = moment.tz(
            `${date}T${availStartTime}`,
            scheduleTimeZone
        );
        const availEndTimeTZ = moment.tz(
            `${date}T${availEndTime}`,
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

    // region Check For Slot Conflict
    private async isSlotConflicted(
        adjustedSlotStart: moment.Moment,
        event: EventDoc
    ): Promise<boolean> {
        // Fetch active bookings for the expert
        const activeBookings = await this.bookingService.findAll({
            expertId: event.owner,
            isActive: true,
            startTime: { $lte: adjustedSlotStart.toDate() },
            endTime: { $gte: adjustedSlotStart.toDate() },
        });

        // Check if the slot overlaps with any active booking
        console.log('Conflicted Slots: ' + activeBookings.length);
        return activeBookings.length > 0;
    }

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
                time: slot,
                timezone: userTimezone,
                startTime: slot,
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
