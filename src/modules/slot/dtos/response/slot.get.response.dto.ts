export class SlotDto {
    time: string;
    timezone: string;
    startTime: string;
    endTime: string;
}

export class SlotsResponseDto {
    slots: Record<string, SlotDto[]>;
}
