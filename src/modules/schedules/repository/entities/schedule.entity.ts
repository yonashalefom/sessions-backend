import { DatabaseEntityAbstract } from 'src/common/database/abstracts/database.entity.abstract';
import {
    DatabaseEntity,
    DatabaseProp,
    DatabaseSchema,
} from 'src/common/database/decorators/database.decorator';
import { IDatabaseDocument } from 'src/common/database/interfaces/database.interface';
import {
    ScheduleAvailabilityEntity,
    ScheduleAvailabilitySchema,
} from 'src/modules/schedules/repository/entities/schedule.availability.entity';
import { UserEntity } from 'src/modules/user/repository/entities/user.entity';

export const ScheduleTableName = 'Schedules';

@DatabaseEntity({ collection: ScheduleTableName })
export class ScheduleEntity extends DatabaseEntityAbstract {
    @DatabaseProp({
        required: true,
        ref: UserEntity.name,
        trim: true,
        index: true,
    })
    userId: string;

    @DatabaseProp({
        required: true,
        trim: true,
        maxlength: 100,
        index: true,
    })
    title: string;

    @DatabaseProp({
        required: false,
        unique: true,
        trim: true,
        maxlength: 50,
    })
    timeZone: string;

    @DatabaseProp({
        required: true,
        schema: [ScheduleAvailabilitySchema],
    })
    availability: ScheduleAvailabilityEntity[];

    @DatabaseProp({
        required: true,
        default: true,
        index: true,
        type: Boolean,
    })
    isActive: boolean;
}

export const ScheduleSchema = DatabaseSchema(ScheduleEntity);
export type ScheduleDoc = IDatabaseDocument<ScheduleEntity>;

ScheduleSchema.index({ userId: 1, title: 1 }, { unique: true });

// region The following code does not work at all, its just added as a reference for the future if i want to use Schema.pre with a different code inside the callback function.
// ScheduleSchema.pre('save', async function (next) {
//     console.log('Schedule Schema Pre Save is being executed.');
//     const schedule = this;
//     const existingSchedule = await mongoose.models.Schedule.findOne({
//         userId: schedule.userId,
//         'availability.days': { $all: schedule.availability[0].days },
//         'availability.startTime': schedule.availability[0].startTime,
//         'availability.endTime': schedule.availability[0].endTime,
//     });
//     if (existingSchedule) {
//         console.log('Existing schedule found');
//         const err = new Error('Duplicate schedule');
//         return next(err);
//     }
//     next();
// });
// endregion
