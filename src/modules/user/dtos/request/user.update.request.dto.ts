import { PickType } from '@nestjs/swagger';
import { UserCreateRequestDto } from 'src/modules/user/dtos/request/user.create.request.dto';

export class UserUpdateRequestDto extends PickType(UserCreateRequestDto, [
    'name',
    'country',
    'role',
] as const) {
    // @ApiProperty({
    //     name: 'availability',
    //     required: true,
    //     nullable: false,
    //     description:
    //         'Contains information about expert availability information.',
    //     type: AvailabilityDto,
    //     example: {
    //         availabilityTimeslots: [
    //             {
    //                 timeslot: ENUM_USER_AVAILABILITY_TIMESLOTS.MINUTES_15,
    //                 price: 1500,
    //             },
    //         ],
    //         availabilityDates: ['2024-08-22T19:05:47.040Z'],
    //     },
    // })
    // @IsOptional()
    // readonly availability?: AvailabilityDto;
}
