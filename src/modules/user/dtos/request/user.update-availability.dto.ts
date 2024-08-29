import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { ENUM_USER_AVAILABILITY_TIMESLOTS } from 'src/modules/user/enums/user.enum';

export class TimeslotDto {
    @ApiProperty({
        example: 'MINUTES_15',
        description: 'Timeslot where the expert is available.',
        required: true,
    })
    timeslot?: ENUM_USER_AVAILABILITY_TIMESLOTS;

    @ApiProperty({
        required: true,
        type: 'integer',
    })
    price?: number;
}

export class AvailabilityDto {
    @ApiProperty({
        description: 'Timeslots the expert have for meetings.',
        example: [
            faker.helpers.arrayElement([
                { timeslot: 'MINUTES_15', price: 1500 },
                { timeslot: 'MINUTES_30', price: 3000 },
            ]),
        ],
        required: true,
        maxLength: 4,
        isArray: true,
        default: [],
    })
    availabilityTimeslots: TimeslotDto[];

    @ApiProperty({
        description: 'Api Key start date',
        example: faker.date.recent(),
        required: true,
    })
    availabilityDates: Date[];
}

export class ExpertUpdateAvailabilityRequestDto {
    @ApiProperty({
        name: 'availability',
        required: true,
        nullable: false,
        description:
            'Contains information about expert availability information.',
        type: AvailabilityDto,
        example: {
            availabilityTimeslots: [
                {
                    timeslot: ENUM_USER_AVAILABILITY_TIMESLOTS.MINUTES_15,
                    price: 1500,
                },
            ],
            availabilityDates: ['2024-08-22T19:05:47.040Z'],
        },
    })
    readonly availability?: AvailabilityDto;
}
