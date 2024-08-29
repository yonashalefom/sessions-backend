import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';

import { CountryCreateRequestDto } from 'src/modules/country/dtos/request/country.create.request.dto';
import { CountryService } from 'src/modules/country/services/country.service';

@Injectable()
export class MigrationCountrySeed {
    constructor(private readonly countryService: CountryService) {}

    @Command({
        command: 'seed:country',
        describe: 'seeds countries',
    })
    async seeds(): Promise<void> {
        try {
            const data: CountryCreateRequestDto[] = [
                {
                    name: 'Ethiopia',
                    alpha2Code: 'ET',
                    alpha3Code: 'ETH',
                    domain: 'et',
                    fipsCode: 'ET',
                    numericCode: '231',
                    phoneCode: ['251'],
                    continent: 'Africa',
                    timeZone: 'Africa/Addis_Ababa',
                },
            ];

            await this.countryService.createMany(data);
        } catch (err: any) {
            throw new Error(err.message);
        }

        return;
    }

    @Command({
        command: 'remove:country',
        describe: 'remove countries',
    })
    async remove(): Promise<void> {
        try {
            await this.countryService.deleteMany({});
        } catch (err: any) {
            throw new Error(err.message);
        }

        return;
    }
}
