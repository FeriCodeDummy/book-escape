// app/api/hotels/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET /api/hotels?fields=id,name,city,country&city=Ljubljana&q=Alpine&active=1
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const fields =
            (url.searchParams.get("fields") ?? "id,name,city,country,is_active,checkin_time,checkout_time")
                .split(",").map(s => s.trim()).filter(Boolean).join(", ");
        const q = url.searchParams.get("q");
        const city = url.searchParams.get("city");
        const country = url.searchParams.get("country");
        const active = url.searchParams.get("active");

        const where: string[] = [];
        const args: any[] = [];

        if (q) { where.push("(name LIKE ? OR description LIKE ? OR city LIKE ?)"); args.push(`%${q}%`, `%${q}%`, `%${q}%`); }
        if (city) { where.push("city = ?"); args.push(city); }
        if (country) { where.push("country = ?"); args.push(country); }
        if (active !== null) { where.push("is_active = ?"); args.push(Number(active) ? 1 : 0); }

        const sql = `SELECT ${fields} FROM hotels ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY created_at DESC`;
        const [rows] = await pool.query(sql, args);
        return NextResponse.json(rows);
    } catch (e) {
        console.error((e as Error).message);
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

// POST /api/hotels
// Body: { name, description?, address_line?, city, country, checkin_time?, checkout_time?, cancellation_policy_days?, is_active?, manager_id? }
export async function POST(req: Request) {
    const conn = await pool.getConnection();
    try {
        const body = await req.json();
        const {
            name, description = null, address_line = null, city, country,
            checkin_time = null, checkout_time = null, cancellation_policy_days = 1,
            is_active = 1, manager_id = null, // optional: link hotel to a manager
        } = body || {};

        if (!name || !city || !country) {
            return NextResponse.json({ error: "name, city, and country are required" }, { status: 400 });
        }

        await conn.beginTransaction();

        const [insert] = await conn.query(
            `INSERT INTO hotels (name, description, address_line, city, country, checkin_time, checkout_time, cancellation_policy_days, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [name, description, address_line, city, country.toUpperCase().slice(0,2),
                checkin_time, checkout_time, Number(cancellation_policy_days), Number(is_active)]
        );
        const hotelId = (insert as any).insertId;

        if (manager_id) {
            await conn.query(
                `INSERT IGNORE INTO manager_hotels (manager_id, hotel_id) VALUES (?, ?)`,
                [Number(manager_id), hotelId]
            );
        }

        await conn.commit();

        const [rows] = await conn.query(
            `SELECT id, name, city, country, address_line, checkin_time, checkout_time, cancellation_policy_days, is_active
             FROM hotels WHERE id = ?`,
            [hotelId]
        );
        return NextResponse.json((rows as any[])[0], { status: 201 });
    } catch (e) {
        await (conn?.rollback?.());
        console.error((e as Error).message);
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    } finally {
        conn.release();
    }
}
