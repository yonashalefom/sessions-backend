import { Injectable } from '@nestjs/common';
import moment from 'moment-timezone';
import { HelperDateService } from 'src/common/helper/services/helper.date.service';
import { HelperURLService } from 'src/common/helper/services/helper.url.service';
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
                const dailySlots = this.generateEventSlots(
                    dateRange,
                    expertAvailability,
                    expertSchedule.timeZone,
                    expertEvent
                );
                availableSlots.push(...dailySlots);
            }
        }

        console.log(JSON.stringify(availableSlots, null, 2));

        return this.groupSlotsByDate(
            availableSlots,
            dateRange.userTimezone,
            expertEvent.duration
        );
    }
    // endregion

    // region Generate Time Slots for an Event
    private generateEventSlots(
        dateRange: DateRangeWithTimezone,
        expertAvailability: ScheduleAvailabilityEntity,
        scheduleTimeZone: string,
        expertEvent: EventDoc
    ): string[] {
        const { days, startTime, endTime } = expertAvailability;

        const availableSlots = [];

        const startDateByUserTimezone = moment(dateRange.start)
            .tz(dateRange.userTimezone)
            .startOf('day');
        const endDateByUserTimezone = moment(dateRange.end)
            .tz(dateRange.userTimezone)
            .endOf('day');

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
                    availableSlots.push(adjustedSlotStart.toISOString());
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

    // private async isSlotConflicted(
    //     adjustedSlotStart: moment.Moment,
    //     event: any
    // ): Promise<boolean> {
    //     return await this.eventService.exists({
    //         owner: event.owner,
    //         eventStartDate: { $lte: adjustedSlotStart.toDate() },
    //         $expr: {
    //             $gt: [
    //                 {
    //                     $add: [
    //                         '$eventStartDate',
    //                         { $multiply: ['$duration', 60000] },
    //                     ],
    //                 },
    //                 adjustedSlotStart.toDate(),
    //             ],
    //         },
    //     });
    // }

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
