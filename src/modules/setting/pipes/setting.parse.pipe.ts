import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { ENUM_SETTING_STATUS_CODE_ERROR } from 'src/modules/setting/enums/setting.status-code.enum';
import { CategoryDoc } from 'src/modules/setting/repository/entities/setting.entity';
import { SettingService } from 'src/modules/setting/services/setting.service';

@Injectable()
export class SettingParsePipe implements PipeTransform {
    constructor(private readonly settingService: SettingService) {}

    async transform(value: any): Promise<CategoryDoc> {
        const setting: CategoryDoc =
            await this.settingService.findOneById(value);
        if (!setting) {
            throw new NotFoundException({
                statusCode: ENUM_SETTING_STATUS_CODE_ERROR.NOT_FOUND,
                message: 'setting.error.notFound',
            });
        }

        return setting;
    }
}
