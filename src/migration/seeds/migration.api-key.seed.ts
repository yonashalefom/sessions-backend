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
            const apiKeyDefaultKey = process.env.DEFAULT_API_KEY;
            const apiKeyDefaultSecret = process.env.DEFAULT_API_SECRET;
            await this.apiKeyService.createRaw({
                name: 'Sample Api Key - Default',
                type: ENUM_API_KEY_TYPE.DEFAULT,
                key: apiKeyDefaultKey,
                secret: apiKeyDefaultSecret,
            });

            const apiKeyPrivateKey = process.env.PRIVATE_API_KEY;
            const apiKeyPrivateSecret = process.env.PRIVATE_API_SECRET;
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
