import { DatabaseEntityAbstract } from 'src/common/database/abstracts/database.entity.abstract';
import {
    DatabaseEntity,
    DatabaseProp,
    DatabaseSchema,
} from 'src/common/database/decorators/database.decorator';
import { IDatabaseDocument } from 'src/common/database/interfaces/database.interface';
import { EventEntity } from 'src/modules/events/repository/entities/event.entity';
import {
    MeetingReferenceEntity,
    MeetingReferenceSchema,
} from 'src/modules/meeting/repository/entities/meeting.reference.entity';
import { UserEntity } from 'src/modules/user/repository/entities/user.entity';

export type MeetingStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export const MeetingTableName = 'meetings';

@DatabaseEntity({ collection: MeetingTableName })
export class MeetingEntity extends DatabaseEntityAbstract {
    @DatabaseProp({
        required: true,
        ref: UserEntity.name,
        trim: true,
        index: true,
    })
    expertId: string;

    @DatabaseProp({
        required: true,
        ref: UserEntity.name,
        trim: true,
        index: true,
    })
    userId: string;

    @DatabaseProp({
        required: true,
        ref: EventEntity.name,
        trim: true,
        index: true,
    })
    eventId: string;

    @DatabaseProp({
        required: false,
        unique: true,
        trim: true,
        maxlength: 500,
        minlength: 15,
    })
    description?: string;

    @DatabaseProp({
        required: true,
        index: 'asc',
        type: Date,
    })
    startTime: Date;

    @DatabaseProp({
        required: true,
        index: 'asc',
        type: Date,
    })
    endTime: Date;

    @DatabaseProp({
        required: false,
        unique: true,
        trim: true,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
        default: 'ACCEPTED',
    })
    status: MeetingStatus;

    @DatabaseProp({
        required: false,
        unique: true,
        trim: true,
        maxlength: 500,
        minlength: 3,
    })
    cancellationReason?: string;

    @DatabaseProp({
        required: false,
        unique: true,
        trim: true,
        maxlength: 500,
        minlength: 3,
    })
    rejectionReason?: string;

    @DatabaseProp({
        required: false,
        type: Number,
    })
    rating?: number;

    @DatabaseProp({
        required: false,
        unique: true,
        trim: true,
        maxlength: 500,
        minlength: 1,
    })
    ratingFeedback?: string;

    @DatabaseProp({
        required: false,
        schema: MeetingReferenceSchema,
    })
    meetingRef?: MeetingReferenceEntity;

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
