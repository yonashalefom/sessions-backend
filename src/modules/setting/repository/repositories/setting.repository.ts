import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { DatabaseRepositoryAbstract } from 'src/common/database/abstracts/database.repository.abstract';
import { DatabaseModel } from 'src/common/database/decorators/database.decorator';
import {
    CategoryDoc,
    SettingEntity,
} from 'src/modules/setting/repository/entities/setting.entity';

@Injectable()
export class SettingRepository extends DatabaseRepositoryAbstract<
    SettingEntity,
    CategoryDoc
> {
    constructor(
        @DatabaseModel(SettingEntity.name)
        private readonly settingModel: Model<SettingEntity>
    ) {
        super(settingModel);
    }
}
