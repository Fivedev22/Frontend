export interface IPayment {
    id_payment?: number;
    payment_number: number;
    createdAt: Date;
    booking: number;
    client: number;
    property: number;
    check_in_date: string;
    check_out_date: string;
    booking_amount: number;
    booking_discount?: number;
    deposit_amount: number;
    payment_amount_subtotal: number;
    payment_amount_total: number;
    payment_type: number;
    payment_status: number;
    is_active?: boolean;
}