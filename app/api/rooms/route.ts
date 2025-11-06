// app/api/rooms/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET /api/rooms?hotelId=...&q=...&maxPrice=...&minCapacity=...
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const hotelId = url.searchParams.get("hotelId");
        const q = url.searchParams.get("q");
        const maxPrice = url.searchParams.get("maxPrice");
        const minCapacity = url.searchParams.get("minCapacity");

        const where: string[] = [];
        const args: any[] = [];

        if (hotelId) { where.push("rt.hotel_id = ?"); args.push(Number(hotelId)); }
        if (q) { where.push("(rt.name LIKE ? OR rt.description LIKE ?)"); args.push(`%${q}%`, `%${q}%`); }
        if (maxPrice) { where.push("rt.base_price <= ?"); args.push(Number(maxPrice)); }
        if (minCapacity) { where.push("rt.capacity >= ?"); args.push(Number(minCapacity)); }

        const sql = `
            SELECT rt.id, rt.hotel_id, h.name AS hotel_name, h.city, h.country,
                   rt.name, rt.description, rt.capacity, rt.base_price, rt.currency, rt.total_rooms
            FROM room_types rt
                     JOIN hotels h ON h.id = rt.hotel_id
                ${where.length ? "WHERE " + where.join(" AND ") : ""}
            ORDER BY rt.base_price ASC, rt.id DESC
        `;
        const [rows] = await pool.query(sql, args);
        return NextResponse.json(rows);
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST /api/rooms
// Body: { hotel_id, name, description?, capacity, base_price, currency, total_rooms }
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { hotel_id, name, description = null, capacity, base_price, currency = "EUR", total_rooms } = body || {};
        if (!hotel_id || !name || !capacity || !base_price || !total_rooms) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const [res] = await pool.query(
            `INSERT INTO room_types (hotel_id, name, description, capacity, base_price, currency, total_rooms, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [Number(hotel_id), name, description, Number(capacity), Number(base_price), currency, Number(total_rooms)]
        );
        const id = (res as any).insertId;

        const [rows] = await pool.query(
            `SELECT id, hotel_id, name, description, capacity, base_price, currency, total_rooms
             FROM room_types WHERE id = ?`,
            [id]
        );
        return NextResponse.json((rows as any[])[0], { status: 201 });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
