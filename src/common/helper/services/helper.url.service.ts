import { Injectable } from '@nestjs/common';
import slugify from 'slugify';

import { IHelperURLService } from 'src/common/helper/interfaces/helper.url-service.interface';

@Injectable()
export class HelperURLService implements IHelperURLService {
    slugify(textToSlugify: string): string {
        // Creating a slug
        return slugify(textToSlugify, {
            lower: true,
            strict: true,
            replacement: '-',
        });
    }
}
