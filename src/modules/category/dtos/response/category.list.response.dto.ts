import { ApiHideProperty, OmitType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { CategoryGetResponseDto } from 'src/modules/category/dtos/response/category.get.response.dto';

export class CategoryListResponseDto extends OmitType(CategoryGetResponseDto, [
    'alpha3Code',
    'fipsCode',
    'continent',
    'domain',
    'timeZone',
    'numericCode',
] as const) {
    @ApiHideProperty()
    @Exclude()
    alpha3Code: string;

    @ApiHideProperty()
    @Exclude()
    fipsCode: string;

    @ApiHideProperty()
    @Exclude()
    continent: string;

    @ApiHideProperty()
    @Exclude()
    domain?: string;

    @ApiHideProperty()
    @Exclude()
    timeZone: string;

    @ApiHideProperty()
    @Exclude()
    numericCode: string;
}
