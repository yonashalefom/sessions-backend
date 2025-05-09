import { Type } from '@nestjs/common';
import {
    InjectConnection,
    InjectModel,
    Prop,
    PropOptions,
    Schema,
    SchemaFactory,
    SchemaOptions,
} from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { DATABASE_CONNECTION_NAME } from 'src/common/database/constants/database.constant';
import {
    IDatabaseQueryContainEmailOnlyOptions,
    IDatabaseQueryContainOptions,
} from 'src/common/database/interfaces/database.interface';

export function InjectDatabaseConnection(
    connectionName?: string
): ParameterDecorator {
    return InjectConnection(connectionName ?? DATABASE_CONNECTION_NAME);
}

export function InjectDatabaseModel(
    entity: any,
    connectionName?: string
): ParameterDecorator {
    return InjectModel(entity, connectionName ?? DATABASE_CONNECTION_NAME);
}

export function DatabaseEntity(options?: SchemaOptions): ClassDecorator {
    return Schema({
        ...options,
        timestamps: options?.timestamps ?? {
            createdAt: true,
            updatedAt: true,
        },
    });
}

export function DatabaseProp(options?: PropOptions): PropertyDecorator {
    return Prop(options);
}

export function DatabaseSchema<T = any, N = MongooseSchema<T>>(
    entity: Type<T>
): N {
    return SchemaFactory.createForClass<T>(entity) as N;
}

export function DatabaseHelperQueryContain(
    field: string,
    value: string,
    options?: IDatabaseQueryContainOptions
) {
    if (options?.fullWord) {
        return {
            [field]: {
                $regex: new RegExp(`\\b${value}\\b`),
                $options: 'i',
            },
        };
    }

    return {
        [field]: {
            $regex: new RegExp(value),
            $options: 'i',
        },
    };
}

export function DatabaseHelperQueryContainEmailOnly(
    field: string,
    value: string,
    options?: IDatabaseQueryContainEmailOnlyOptions
) {
    const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (options?.exact) {
        return {
            [field]: {
                $regex: new RegExp(`^${escapedValue}$`),
                $options: 'i',
            },
        };
    } else if (options?.fullWord) {
        return {
            [field]: {
                $regex: new RegExp(`\\b${escapedValue}\\b`),
                $options: 'i',
            },
        };
    } else {
        return {
            [field]: {
                $regex: new RegExp(escapedValue),
                $options: 'i',
            },
        };
    }
}

export function DatabaseQueryOr(queries: Record<string, any>[]) {
    return {
        $or: queries,
    };
}

export function DatabaseQueryAnd(queries: Record<string, any>[]) {
    return {
        $and: queries,
    };
}
