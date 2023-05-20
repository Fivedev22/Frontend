import { IClient } from "./client.interface";
import { IPaymentStatus } from "./payment_status.interface";
import { IPaymentType } from "./payment_type.interface";
import { IProperty } from "./property.interface";
import { IReservation } from "./reservation.interface";

export interface IPayment {
    id_payment?: number;
    createdAt: Date;
    payment_number: number;
    booking: IReservation;
    client: IClient;
    property: IProperty;
    check_in_date: string;
    check_out_date: string;
    booking_starting_price: number;
    booking_discount?: number;
    deposit_amount: number;
    booking_amount: number;
    extra_expenses?: number;
    payment_amount_subtotal: number;
    payment_amount_total: number;
    payment_type: IPaymentType;
    payment_status: IPaymentStatus;
    is_active?: boolean;
}