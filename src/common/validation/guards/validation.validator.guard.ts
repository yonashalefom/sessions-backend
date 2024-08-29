import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import Joi from 'joi';
import { IRequestApp } from 'src/common/request/interfaces/request.interface';

import { ENUM_VALIDATION_STATUS_CODE_ERROR } from 'src/common/validation/constants/validation.error-status-code.constants';

@Injectable()
export class ValidationGuard implements CanActivate {
    constructor(private readonly schema: Joi.ObjectSchema<any>) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx: HttpArgumentsHost = context.switchToHttp();
        const request: IRequestApp = ctx.getRequest<IRequestApp>();

        const { body } = request;

        // region Validation Options
        const options = {
            abortEarly: false, // include all errors
            convert: true,
            allowUnknown: true, // ignore unknown props
            stripUnknown: true, // remove unknown props
        };
        // endregion

        try {
            await this.schema.validateAsync(body, options);
        } catch (error) {
            throw new BadRequestException({
                statusCode: ENUM_VALIDATION_STATUS_CODE_ERROR.VALIDATION_ERROR,
                message: error.message,
            });
        }

        return true;
    }
}
