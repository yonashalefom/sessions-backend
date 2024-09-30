import { ApiHideProperty, ApiProperty, OmitType } from '@nestjs/swagger';
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

    @ApiHideProperty()
    @ApiProperty({
        description: 'Flag for deleted',
        default: false,
        required: true,
        nullable: false,
    })
    @Exclude()
    deleted: boolean;

    @ApiHideProperty()
    @ApiProperty({
        description: 'indicates if the category is active or not',
        required: false,
    })
    @Exclude()
    isActive: boolean;
}
