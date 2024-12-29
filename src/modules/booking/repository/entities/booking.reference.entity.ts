import {
    DatabaseEntity,
    DatabaseProp,
    DatabaseSchema,
} from 'src/common/database/decorators/database.decorator';
import { IDatabaseDocument } from 'src/common/database/interfaces/database.interface';
import { BookingType } from 'src/modules/booking/dtos/request/booking.create.request.dto';

@DatabaseEntity({ timestamps: false, _id: false })
export class BookingReferenceEntity {
    @DatabaseProp({
        required: false,
        type: String,
    })
    type?: BookingType;

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
