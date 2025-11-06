// app/api/hotels/[id]/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(_req: Request, context: { params: Promise<{ id: string; }> }) {
    try {
        const id = Number((await context.params).id);
        if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

        const [hotelRows] = await pool.query(
            `SELECT h.*,
              COALESCE(AVG(r.rating),0) AS avg_rating,
              COUNT(r.id) AS review_count
       FROM hotels h
       LEFT JOIN reviews r ON r.hotel_id = h.id
       WHERE h.id = ?
       GROUP BY h.id`,
            [id]
        );
        if (!(hotelRows as any[]).length) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        const hotel = (hotelRows as any[])[0];

        const [photos] = await pool.query(
            `SELECT id, url, is_cover, sort_order FROM hotel_photos WHERE hotel_id = ? ORDER BY sort_order ASC, id ASC`,
            [id]
        );

        const [rooms] = await pool.query(
            `SELECT id, name, description, capacity, base_price, currency, total_rooms
       FROM room_types WHERE hotel_id = ? ORDER BY base_price ASC, id DESC`,
            [id]
        );

        const [reviews] = await pool.query(
            `SELECT r.id, u.name, u.surname, r.rating, r.comment, r.created_at
         FROM reviews r
         JOIN users u ON u.id = r.user_id
       WHERE r.hotel_id = ?
       ORDER BY r.created_at DESC
       LIMIT 10`,
            [id]
        );

        return NextResponse.json({ ...hotel, photos, rooms, reviews });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
