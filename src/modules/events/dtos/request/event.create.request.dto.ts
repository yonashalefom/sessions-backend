export class EventCreateRequestDto {
    title: string;
    description: string;
    eventStartDate?: string;
    eventEndDate?: string;
    bookingOffsetMinutes?: string;
    currency?: string;
    price: number;
    duration: number;
}
