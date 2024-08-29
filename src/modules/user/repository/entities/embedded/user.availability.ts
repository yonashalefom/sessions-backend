import {
    DatabaseEntity,
    DatabaseProp,
    DatabaseSchema,
} from 'src/common/database/decorators/database.decorator';
import { IDatabaseDocument } from 'src/common/database/interfaces/database.interface';
import { ENUM_USER_AVAILABILITY_TIMESLOTS } from 'src/modules/user/enums/user.enum';

// region Timeslot
export class Timeslot {
    @DatabaseProp({
        required: true,
        type: ENUM_USER_AVAILABILITY_TIMESLOTS,
    })
    timeslot: ENUM_USER_AVAILABILITY_TIMESLOTS;

    @DatabaseProp({
        required: true,
        type: Number,
    })
    price: number;
}
// endregion

// region User Availability Entity
@DatabaseEntity({
    _id: false,
    timestamps: false,
})
export class UserAvailabilityEntity {
    @DatabaseProp({
        required: false,
        type: [Timeslot],
    })
    availabilityTimeslots: Timeslot[];

    @DatabaseProp({
        required: true,
        type: [Date],
    })
    availabilityDates: Date[];
}

export const UserAvailabilitySchema = DatabaseSchema(UserAvailabilityEntity);
export type UserAvailabilityDoc = IDatabaseDocument<UserAvailabilityEntity>;
// endregion
