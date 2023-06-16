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
    booking_starting_price: string;
    booking_discount?: string;
    deposit_amount: string;
    booking_amount: string;
    extra_expenses?: string;
    payment_amount_subtotal: string;
    payment_amount_total: string;
    payment_type: IPaymentType;
    payment_status: IPaymentStatus;
    is_active?: boolean;
}