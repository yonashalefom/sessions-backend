import { ApiProperty } from '@nestjs/swagger';
import { HealthCheckStatus, HealthIndicatorResult } from '@nestjs/terminus';

export class HealthDatabaseResponseDto {
    @ApiProperty({
        required: true,
        examples: ['error', 'ok', 'shutting_down'],
    })
    status: HealthCheckStatus;

    @ApiProperty({
        required: true,
        example: {
            database: {
                status: 'up',
            },
        },
    })
    info?: HealthIndicatorResult;

    @ApiProperty({
        required: true,
        example: {
            database: {
                status: 'down',
            },
        },
    })
    error?: HealthIndicatorResult;

    @ApiProperty({
        required: true,
        example: {
            database: {
                status: 'up',
            },
        },
    })
    details: HealthIndicatorResult;
}
