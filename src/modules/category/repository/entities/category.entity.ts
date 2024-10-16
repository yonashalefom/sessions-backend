import { DatabaseEntityAbstract } from 'src/common/database/abstracts/database.entity.abstract';
import {
    DatabaseEntity,
    DatabaseProp,
    DatabaseSchema,
} from 'src/common/database/decorators/database.decorator';
import { IDatabaseDocument } from 'src/common/database/interfaces/database.interface';

export const CountryTableName = 'Categories';

@DatabaseEntity({ collection: CountryTableName })
export class CategoryEntity extends DatabaseEntityAbstract {
    @DatabaseProp({
        required: true,
        unique: true,
        trim: true,
        index: true,
        maxlength: 100,
    })
    category: string;

    @DatabaseProp({
        required: false,
        unique: true,
        trim: true,
        maxlength: 500,
        minlength: 15,
    })
    description: string;

    @DatabaseProp({
        required: false,
        unique: true,
        trim: true,
        index: true,
        maxlength: 100,
    })
    categoryImage: string;

    @DatabaseProp({
        required: true,
        unique: true,
        trim: true,
        index: true,
        maxlength: 100,
    })
    slug: string;

    @DatabaseProp({
        required: true,
        default: true,
        index: true,
        type: Boolean,
    })
    isActive: boolean;
}

export const CategorySchema = DatabaseSchema(CategoryEntity);
export type CategoryDoc = IDatabaseDocument<CategoryEntity>;
