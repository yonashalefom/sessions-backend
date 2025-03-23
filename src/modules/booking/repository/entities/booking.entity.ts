import {
    DatabaseEntity,
    DatabaseProp,
    DatabaseSchema,
} from 'src/common/database/decorators/database.decorator';
import { IDatabaseDocument } from 'src/common/database/interfaces/database.interface';
import {
    BookingReferenceEntity,
    BookingReferenceSchema,
} from 'src/modules/booking/repository/entities/booking.reference.entity';
import { EventEntity } from 'src/modules/events/repository/entities/event.entity';
import { UserEntity } from 'src/modules/user/repository/entities/user.entity';
import { DatabaseEntityBase } from 'src/common/database/bases/database.entity';

export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export const BookingTableName = 'Bookings';

@DatabaseEntity({ collection: BookingTableName })
export class BookingEntity extends DatabaseEntityBase {
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
        type: String,
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
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
        default: 'ACCEPTED',
    })
    status: BookingStatus;

    @DatabaseProp({
        required: false,
        unique: true,
        trim: true,
        type: String,
        maxlength: 500,
        minlength: 3,
    })
    cancellationReason?: string;

    @DatabaseProp({
        required: false,
        unique: true,
        trim: true,
        type: String,
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
        type: String,
        maxlength: 500,
        minlength: 1,
    })
    ratingFeedback?: string;

    @DatabaseProp({
        required: false,
        schema: BookingReferenceSchema,
    })
    bookingRef?: BookingReferenceEntity;

    @DatabaseProp({
        required: true,
        default: true,
        index: true,
        type: Boolean,
    })
    isActive: boolean;
}

export const BookingSchema = DatabaseSchema(BookingEntity);
export type BookingDoc = IDatabaseDocument<BookingEntity>;

// BookingSchema.index({ owner: 1, title: 1 }, { unique: true });
