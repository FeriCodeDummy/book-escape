import {NextRequest, NextResponse} from "next/server";
import mysql from  'mysql2/promise';
import {HotelEntity} from "@/types/enities";
import GetDBSettings from "@/conf/IDB";

interface err {
    error: string;
}

export async function GET(request:NextRequest): Promise<NextResponse<HotelEntity[] | err>> {

    const params = GetDBSettings();
    try {
        const connection = await mysql.createConnection(params)
        const sql = "SELECT `id`, `name`, `description`, `address_line`, `checkin_time`, `checkout_time`, `cancellation_policy_days`, `is_active` FROM hotels WHERE 1";
        const [results] = await connection.execute<HotelEntity[]>(sql, [])

        return NextResponse.json(results, {status: 200, statusText: 'ok'})
    }catch (error){
        console.error((error as Error).message)
        return NextResponse.json({error: (error as Error).message}, {status: 400})
    }
}