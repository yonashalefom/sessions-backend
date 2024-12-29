import {
    DatabaseEntity,
    DatabaseProp,
    DatabaseSchema,
} from 'src/common/database/decorators/database.decorator';
import { ENUM_SCHEDULE_DAYS } from 'src/modules/schedules/enums/schedule.enum';

@DatabaseEntity({ timestamps: false, _id: false })
export class ScheduleAvailabilityEntity {
    @DatabaseProp({
        required: true,
        type: [Number],
        enum: ENUM_SCHEDULE_DAYS,
        default: [],
    })
    days: ENUM_SCHEDULE_DAYS[];

    @DatabaseProp({
        required: true,
        type: String,
    })
    startTime: string;

    @DatabaseProp({
        required: true,
        type: String,
    })
    endTime: string;
}

export const ScheduleAvailabilitySchema = DatabaseSchema(
    ScheduleAvailabilityEntity
);
