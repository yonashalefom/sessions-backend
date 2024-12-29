import { DatabaseEntityAbstract } from 'src/common/database/abstracts/database.entity.abstract';
import {
    DatabaseEntity,
    DatabaseProp,
    DatabaseSchema,
} from 'src/common/database/decorators/database.decorator';
import { IDatabaseDocument } from 'src/common/database/interfaces/database.interface';
import { UserEntity } from 'src/modules/user/repository/entities/user.entity';

export type CallType = 'default';

export const MeetingTableName = 'Meetings';

@DatabaseEntity({ collection: MeetingTableName })
export class MeetingEntity extends DatabaseEntityAbstract {
    @DatabaseProp({
        required: true,
        unique: true,
        trim: true,
    })
    meetingId: string;

    @DatabaseProp({
        required: true,
        trim: true,
        maxlength: 25,
    })
    type: CallType;

    @DatabaseProp({
        required: true,
        ref: UserEntity.name,
        trim: true,
        index: true,
    })
    createdBy: string;

    @DatabaseProp({
        required: true,
        default: true,
        index: true,
        type: Boolean,
    })
    isActive: boolean;
}

export const MeetingSchema = DatabaseSchema(MeetingEntity);
export type MeetingDoc = IDatabaseDocument<MeetingEntity>;

// BookingSchema.index({ owner: 1, title: 1 }, { unique: true });
