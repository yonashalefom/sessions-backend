import { applyDecorators } from '@nestjs/common';
import {
    Doc,
    DocAuth,
    DocRequest,
    DocResponse,
} from 'src/common/doc/decorators/doc.decorator';
import { ENUM_DOC_REQUEST_BODY_TYPE } from 'src/common/doc/enums/doc.enum';
import { ExpertUpdateAvailabilityRequestDto } from 'src/modules/user/dtos/request/user.update-availability.dto';

export function ExpertUpdateAvailabilityDoc(): MethodDecorator {
    return applyDecorators(
        Doc({
            summary: 'update expert availability times',
        }),
        DocRequest({
            bodyType: ENUM_DOC_REQUEST_BODY_TYPE.JSON,
            dto: ExpertUpdateAvailabilityRequestDto,
        }),
        DocAuth({
            xApiKey: true,
            jwtAccessToken: true,
        }),
        DocResponse('expert.updateAvailability')
    );
}
