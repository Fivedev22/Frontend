import { IGenderType } from "./gender_type.interface";
import { IProvince } from "./province.interface";

export interface IClient {
    id_client?: number,
    name: string,
    last_name: string,
    email: string,
    phone_number: string,
    document_number: string,
    is_foreign: boolean,
    is_active?: boolean,
    gender_type: IGenderType,
    document_type: number,
    province?: IProvince
}