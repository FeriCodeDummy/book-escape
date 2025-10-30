import {NextRequest, NextResponse} from "next/server";
import mysql from  'mysql2/promise';
import {HotelEntity} from "@/types/enities";
import GetDBSettings from "@/conf/IDB";

interface err {
    error: string;
}

export async function GET(request:NextRequest,  { params }: { params: { id: string }}): Promise<NextResponse<HotelEntity[] | err>> {

    const hotelId = Number(params.id);
    if (isNaN(hotelId)) {
        return NextResponse.json({ error: "Invalid hotel ID" }, { status: 400 });
    }
    const dbparams = GetDBSettings();
    try {
        const connection = await mysql.createConnection(dbparams)
        const sql = "SELECT `id`, `name`, `description`, `address_line`, `checkin_time`, `checkout_time`, `cancellation_policy_days`, `is_active` FROM hotels WHERE  id = ?";
        const vals = [hotelId];
        const [results] = await connection.execute<HotelEntity[]>(sql, vals);

        return NextResponse.json(results, {status: 200, statusText: 'ok'})
    }catch (error){
        console.error((error as Error).message)
        return NextResponse.json({error: (error as Error).message}, {status: 400});
    }
}