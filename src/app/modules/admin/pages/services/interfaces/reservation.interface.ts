export interface IReservation {
    id_booking?: number;
    booking_number: number;
    createdAt: Date;
    booking_type: number;
    booking_origin: number;
    client: number;
    property: number;
    adults_number: number;
    kids_number: number;
    pets_number?: number;
    check_in_date: string;
    check_out_date: string;
    check_in_hour: string;
    check_out_hour: string;
    starting_price: number;
    discount?: number;
    deposit_amount: number;
    estimated_amount_deposit: number;
    booking_amount: number;
    is_active?: boolean;
}