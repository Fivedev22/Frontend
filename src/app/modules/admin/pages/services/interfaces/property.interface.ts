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
    daily_rent: boolean;
    monthly_rent: boolean;
    annual_rent: boolean;
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
    availability_status: number;
    activity_status: number;
    is_active?: boolean;
}