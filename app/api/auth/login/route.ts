import {NextRequest, NextResponse} from "next/server";
import {cookies} from "next/headers";
import GetDBSettings from "@/conf/IDB";
import mysql from  'mysql2/promise';
import {LoginReturnBody} from "@/types/commons";
import {SHA256} from 'crypto-es';
import {LoginEntity} from "@/types/enities";




export async function POST(request:NextRequest): Promise<NextResponse<LoginReturnBody>> {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    const params = GetDBSettings();
    const value = session?.value ?? null;
    if (value) {
        try {
            const connection = await mysql.createConnection(params);

            const sql = "SELECT name, surname, email from users as u JOIN sessions as s ON s.user_id = u.id where s.session_id = ?;";

            const vals = [value]

            const [results] = await connection.execute<LoginEntity[]>(sql, vals);

            return NextResponse.json(results[0], {status:200});

        }
        catch (error ) {
            console.log(error);
            return NextResponse.json({error: (error as Error).message}, {status: 500});

        }
    }

    else {
        const body = await request.json();
        const email = body.email;
        const password = body.password;
        try {
            const connection = await mysql.createConnection(params);

            let sql = "SELECT id, name, surname, email from users where email = ? AND password_hash = ?;";
            let vals = [email, password];
            const [results] = await connection.execute<LoginEntity[]>(sql, vals);

            if (Array.isArray(results) && results.length === 1) {

                const seed = ():number =>{
                        const min = 10000000000
                        const max = Math.floor(99999999999);
                        return Math.floor(Math.random() * (max - min + 1)) + min;
                }

                const sid = SHA256(seed().toString()).toString();

                sql = "INSERT INTO sessions (`user_id`, `session_id`) VALUES (?,?);";
                vals = [results[0].id!, sid]


                await connection.execute(sql, vals);

                cookieStore.set({
                    name: "session",
                    value: sid,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                    maxAge: 60 * 60 * 24 * 7, // 7 days
                });

            }
        }
        catch (error) {
            console.log((error as Error).message);
            return NextResponse.json({error: (error as Error).message}, {status: 500})
        }
    }


    return NextResponse.json({error: "shit failed idk"}, {status: 500});

}

