import {
    DatabaseEntity,
    DatabaseProp,
    DatabaseSchema,
} from 'src/common/database/decorators/database.decorator';
import { IDatabaseDocument } from 'src/common/database/interfaces/database.interface';

// region Expert Profile Entity
@DatabaseEntity({
    _id: false,
    timestamps: false,
})
export class ExpertProfileEntity {
    @DatabaseProp({
        required: false,
        type: String,
    })
    portraitProfile: string;

    @DatabaseProp({
        required: false,
        type: String,
    })
    landscapeProfile: string;

    @DatabaseProp({
        required: false,
        type: String,
    })
    aboutExpert: string;
}

export const ExpertProfileSchema = DatabaseSchema(ExpertProfileEntity);
export type ExpertProfileDoc = IDatabaseDocument<ExpertProfileEntity>;
// endregion
