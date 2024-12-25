import {
    DatabaseEntity,
    DatabaseProp,
    DatabaseSchema,
} from 'src/common/database/decorators/database.decorator';
import { IDatabaseDocument } from 'src/common/database/interfaces/database.interface';

@DatabaseEntity({ timestamps: false, _id: false })
export class BookingReferenceEntity {
    // @DatabaseProp({
    //     required: true,
    //     type: [Number],
    //     enum: ENUM_SCHEDULE_DAYS,
    //     default: [],
    // })
    // days: ENUM_SCHEDULE_DAYS[];

    @DatabaseProp({
        required: false,
        type: String,
    })
    type?: string;

    @DatabaseProp({
        required: false,
        type: String,
    })
    meetingId?: string;

    @DatabaseProp({
        required: false,
        type: String,
    })
    meetingUrl?: string;
}

export const BookingReferenceSchema = DatabaseSchema(BookingReferenceEntity);
export type BookingReferenceDoc = IDatabaseDocument<BookingReferenceEntity>;
