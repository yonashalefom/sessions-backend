import { ApiHideProperty, OmitType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { CategoryListResponseDto } from 'src/modules/category/dtos/response/category.list.response.dto';

export class CategoryShortResponseDto extends OmitType(
    CategoryListResponseDto,
    ['createdAt', 'updatedAt']
) {
    @ApiHideProperty()
    @Exclude()
    createdAt: Date;

    @ApiHideProperty()
    @Exclude()
    updatedAt: Date;
}
