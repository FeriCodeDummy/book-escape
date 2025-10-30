import {RowDataPacket} from "mysql2";

export interface LoginEntity extends RowDataPacket {
    id?: number;
    name: string;
    surname: string;
    email: string;
}