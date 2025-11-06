import {NextResponse} from "next/server";
import {pool} from "@/lib/db";




export async function POST(request: Request): Promise<NextResponse> {

    try{
        const body = await request.json();
        const {email} = body
        const sql = 'select id from managers where email=?;'
        const vals = [email]

        const [res] = await pool.query(sql, vals);

        console.log(res)
        return NextResponse.json(res, {status: 200, statusText: 'ok'})


    } catch (e){
        console.error(e)
        return NextResponse.json({error: (e as Error).message, status: 400});
    }


}