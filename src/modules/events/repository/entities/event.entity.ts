import {
    DatabaseEntity,
    DatabaseProp,
    DatabaseSchema,
} from 'src/common/database/decorators/database.decorator';
import { IDatabaseDocument } from 'src/common/database/interfaces/database.interface';
import { UserEntity } from 'src/modules/user/repository/entities/user.entity';
import { DatabaseEntityBase } from 'src/common/database/bases/database.entity';

export const EventTableName = 'Events';

@DatabaseEntity({ collection: EventTableName })
export class EventEntity extends DatabaseEntityBase {
    @DatabaseProp({
        required: true,
        ref: UserEntity.name,
        trim: true,
        index: true,
    })
    owner: string;

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
        maxlength: 500,
        minlength: 15,
    })
    description: string;

    @DatabaseProp({
        required: true,
        unique: true,
        trim: true,
        index: true,
        maxlength: 100,
    })
    slug: string;

    @DatabaseProp({
        required: false,
        type: Date,
        default: new Date(),
    })
    eventStartDate?: Date;

    @DatabaseProp({
        required: false,
        type: Date,
    })
    eventEndDate?: Date;

    @DatabaseProp({
        required: false,
        type: Number,
        default: 0,
    })
    bookingOffsetMinutes?: number;

    @DatabaseProp({
        trim: true,
        maxlength: 3,
        default: 'USD',
    })
    currency?: string;

    @DatabaseProp({
        required: true,
        type: Number,
    })
    price: number;

    @DatabaseProp({
        required: true,
        type: Number,
    })
    duration: number;

    @DatabaseProp({
        required: true,
        default: true,
        index: true,
        type: Boolean,
    })
    isActive: boolean;
}

export const EventSchema = DatabaseSchema(EventEntity);
export type EventDoc = IDatabaseDocument<EventEntity>;

EventSchema.index({ owner: 1, title: 1 }, { unique: true });
