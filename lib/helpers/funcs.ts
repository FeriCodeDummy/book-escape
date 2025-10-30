import {Hotel, ID} from "@/types/commons";
import {db} from "@/lib/data/db";

export function getHotelCoverPhoto(hotelId: ID): string | null {
    const p = db.hotel_photos.filter(p => p.hotel_id === hotelId).sort((a,b) => (b.is_cover?1:0) - (a.is_cover?1:0) || a.sort_order - b.sort_order)[0];
    return p?.url ?? null;
}


export function getHotelMinPrice(hotelId: ID): number | null {
    const types = db.room_types.filter(r => r.hotel_id === hotelId);
    if (!types.length) return null;
    return Math.min(...types.map(t => t.base_price));
}


export function getHotelRating(hotelId: ID): { avg: number; count: number } {
    const rs = db.reviews.filter(r => r.hotel_id === hotelId && r.is_public);
    if (!rs.length) return { avg: 0, count: 0 };
    const avg = rs.reduce((acc, r) => acc + r.rating, 0) / rs.length;
    return { avg, count: rs.length };
}