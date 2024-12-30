import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { HelperDateService } from 'src/common/helper/services/helper.date.service';
import { ENUM_CATEGORY_STATUS_CODE_ERROR } from 'src/modules/category/enums/category.status-code.enum';

@Injectable()
export class DateParsePipe implements PipeTransform {
    constructor(private readonly helperDateService: HelperDateService) {}

    async transform(value: any): Promise<Date> {
        if (!this.helperDateService.checkIso(value)) {
            throw new BadRequestException({
                statusCode: ENUM_CATEGORY_STATUS_CODE_ERROR.NOT_FOUND,
                message: 'general.error.invalidDate',
            });
        }

        const date = this.helperDateService.create(value);

        return this.helperDateService.startOfDay(date);
    }
}
