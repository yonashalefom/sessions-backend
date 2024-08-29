import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';

import { ENUM_API_KEY_TYPE } from 'src/modules/api-key/enums/api-key.enum';
import { ApiKeyService } from 'src/modules/api-key/services/api-key.service';

@Injectable()
export class MigrationApiKeySeed {
    constructor(private readonly apiKeyService: ApiKeyService) {}

    @Command({
        command: 'seed:apikey',
        describe: 'seeds apikeys',
    })
    async seeds(): Promise<void> {
        try {
            const apiKeyDefaultKey = 'development_PcEBjox1JDUwnaJ8BjtHPlZYY';
            const apiKeyDefaultSecret = 'FVTiMyN89dbmiMwjPrzH7fCLGqClAuO9NRn';
            await this.apiKeyService.createRaw({
                name: 'Sample Api Key - Default',
                type: ENUM_API_KEY_TYPE.DEFAULT,
                key: apiKeyDefaultKey,
                secret: apiKeyDefaultSecret,
            });

            const apiKeyPrivateKey = 'development_QBwDwg7JP284datxZUi9Kpmxa';
            const apiKeyPrivateSecret = 'abWpZuIiSr3NKjzqvzU1VNkZmSnSL2dnDWQ';
            await this.apiKeyService.createRaw({
                name: 'Sample Api Key - System',
                type: ENUM_API_KEY_TYPE.SYSTEM,
                key: apiKeyPrivateKey,
                secret: apiKeyPrivateSecret,
            });
        } catch (err: any) {
            throw new Error(err.message);
        }

        return;
    }

    @Command({
        command: 'remove:apikey',
        describe: 'remove apikeys',
    })
    async remove(): Promise<void> {
        try {
            await this.apiKeyService.deleteMany({});
        } catch (err: any) {
            throw new Error(err.message);
        }

        return;
    }
}
