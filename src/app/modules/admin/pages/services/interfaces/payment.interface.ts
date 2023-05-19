export interface IPayment {
    id_payment?: number;
    createdAt: Date;
    payment_number: number;
    booking: number;
    client: number;
    property: number;
    check_in_date: string;
    check_out_date: string;
    booking_starting_price: number;
    booking_discount?: number;
    deposit_amount: number;
    booking_amount: number;
    extra_expenses?: number;
    payment_amount_subtotal: number;
    payment_amount_total: number;
    payment_type: number;
    payment_status: number;
    is_active?: boolean;
}