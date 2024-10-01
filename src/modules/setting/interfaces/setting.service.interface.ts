import {
    IDatabaseCreateOptions,
    IDatabaseDeleteManyOptions,
    IDatabaseFindAllOptions,
    IDatabaseGetTotalOptions,
    IDatabaseOptions,
    IDatabaseSaveOptions,
} from 'src/common/database/interfaces/database.interface';
import { ENUM_SETTING_DATA_TYPE } from 'src/modules/setting/enums/setting.enum';
import { SettingCreateRequestDto } from 'src/modules/setting/dtos/request/setting.create.request.dto';
import { SettingUpdateRequestDto } from 'src/modules/setting/dtos/request/setting.update.request.dto';
import { SettingGetResponseDto } from 'src/modules/setting/dtos/response/setting.get.response.dto';
import { SettingListResponseDto } from 'src/modules/setting/dtos/response/setting.list.response.dto';
import { CategoryDoc } from 'src/modules/setting/repository/entities/setting.entity';

export interface ISettingService {
    findAll(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<CategoryDoc[]>;
    findOne(
        find: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<CategoryDoc>;
    findOneById(_id: string, options?: IDatabaseOptions): Promise<CategoryDoc>;
    findOneByName(
        name: string,
        options?: IDatabaseOptions
    ): Promise<CategoryDoc>;
    getTotal(
        find?: Record<string, any>,
        options?: IDatabaseGetTotalOptions
    ): Promise<number>;
    create(
        { name, description, type, value }: SettingCreateRequestDto,
        options?: IDatabaseCreateOptions
    ): Promise<CategoryDoc>;
    update(
        repository: CategoryDoc,
        { description, value }: SettingUpdateRequestDto,
        options?: IDatabaseSaveOptions
    ): Promise<CategoryDoc>;
    deleteMany(
        find: Record<string, any>,
        options?: IDatabaseDeleteManyOptions
    ): Promise<boolean>;
    getValue<T>(type: ENUM_SETTING_DATA_TYPE, value: string): T;
    checkValue(type: ENUM_SETTING_DATA_TYPE, value: string): boolean;
    getTimezone(): Promise<string>;
    getTimezoneOffset(): Promise<string>;
    mapList<T = any>(
        settings: CategoryDoc[]
    ): Promise<SettingListResponseDto<T>[]>;
    mapGet<T = any>(setting: CategoryDoc): Promise<SettingGetResponseDto<T>>;
}
