import { IActivityStatus } from "./activity_status.interface";
import { IAvailabilityStatus } from "./availability_status.interface";
import { IPropertyType } from "./property_type.interface";
import { IProvince } from "./province.interface";

export interface IProperty {
    id_property?: number;
    reference_number: number;
    property_name: string;
    property_type: IPropertyType;
    square_meter?: string;
    street: string;
    street_number: string;
    building_floor?: string;
    province: IProvince;
    town: string;
    district: string;
    rooms_number: number;
    bathrooms_number: number;
    internet: boolean;
    pool: boolean;
    kitchen: boolean;
    laundry_equipment: boolean;
    yard: boolean;
    parking: boolean;
    disabled_access: boolean;
    kids_beds: boolean;
    availability_status: IAvailabilityStatus;
    activity_status: IActivityStatus;
    is_active?: boolean;
}