import { IClient } from "./client.interface";
import { IProperty } from "./property.interface";
import { IReservationOrigin } from "./reservation_origin.interface";
import { IReservationType } from "./reservation_type.interface";

export interface IReservation {
    id_booking?: number;
    booking_number: number;
    createdAt: Date;
    booking_type: IReservationType;
    booking_origin: IReservationOrigin;
    client: IClient;
    property: IProperty;
    adults_number: number;
    kids_number: number;
    pets_number?: number;
    check_in_date: Date;
    check_out_date: Date;
    check_in_hour: string;
    check_out_hour: string;
    starting_price: string;
    discount?: string;
    deposit_amount: string;
    estimated_amount_deposit: string;
    booking_amount: string;
    is_active?: boolean;
}