import {
    Admin,
    EmailVerification, Favorite, Hotel,
    HotelPhoto,
    Manager,
    ManagerHotel, Reservation, ReservationItem, ReservationStatusHistory, Review,
    RoomInventory,
    RoomType,
    User,
    Notification
} from "@/types/commons";


const nowISO = () => new Date().toISOString();
const daysFromNow = (d: number) => new Date(Date.now() + d*24*60*60*1000);
const iso = (d: Date) => d.toISOString();


// Simple image placeholders (unsplash-style). Replace with your CDN if needed.
const img = {
    alpine: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop",
    coast: "https://images.unsplash.com/photo-1501117716987-c8e2aeb6f9ef?q=80&w=1600&auto=format&fit=crop",
    city: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1600&auto=format&fit=crop",
    spa: "https://images.unsplash.com/photo-1551892589-865f69869443?q=80&w=1600&auto=format&fit=crop",
    room: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop",
};


export const db = (() => {
    const users: User[] = [
        {
            id: 1,
            email: "alice@example.com",
            password_hash: "hash",
            is_verified: true,
            status: "active",
            created_at: nowISO(),
            updated_at: nowISO()
        },
        {
            id: 2,
            email: "bob@example.com",
            password_hash: "hash",
            is_verified: true,
            status: "active",
            created_at: nowISO(),
            updated_at: nowISO()
        },
        {
            id: 3,
            email: "charlie@example.com",
            password_hash: "hash",
            is_verified: false,
            status: "active",
            created_at: nowISO(),
            updated_at: nowISO()
        },
    ];


    const email_verifications: EmailVerification[] = [
        {id: 1, user_id: 3, token: "tok_123", expires_at: iso(daysFromNow(1)), used_at: null, created_at: nowISO()},
    ];


    const admins: Admin[] = [
        {
            id: 1,
            email: "root@yourapp.io",
            password_hash: "hash",
            status: "active",
            otp_secret: "OTPSECRET",
            created_at: nowISO(),
            updated_at: nowISO()
        },
    ];


    const managers: Manager[] = [
        {
            id: 1,
            email: "gm@lakeside.si",
            password_hash: "hash",
            name: "Lara",
            phone: "+386 40 123 456",
            status: "active",
            created_at: nowISO(),
            updated_at: nowISO()
        },
        {
            id: 2,
            email: "gm@seaview.hr",
            password_hash: "hash",
            name: "Ivo",
            phone: "+385 91 555 111",
            status: "active",
            created_at: nowISO(),
            updated_at: nowISO()
        },
    ];


    const hotels: Hotel[] = [
        {
            id: 1,
            name: "Lakeside Alpine Hotel",
            description: "Boutique retreat by the lake with spa & panoramic views.",
            address_line: "Cesta 1",
            city: "Bled",
            country: "SI",
            latitude: 46.369,
            longitude: 14.114,
            checkin_time: "15:00:00",
            checkout_time: "11:00:00",
            cancellation_policy_days: 2,
            is_active: true,
            created_at: nowISO(),
            updated_at: nowISO()
        },
        {
            id: 2,
            name: "Seaview Riviera Resort",
            description: "Modern seaside resort with rooftop pool and co-working.",
            address_line: "Ulica 5",
            city: "Split",
            country: "HR",
            latitude: 43.508,
            longitude: 16.439,
            checkin_time: "14:00:00",
            checkout_time: "10:00:00",
            cancellation_policy_days: 3,
            is_active: true,
            created_at: nowISO(),
            updated_at: nowISO()
        },
        {
            id: 3,
            name: "City Central Stay",
            description: "Affordable comfort in the heart of the city.",
            address_line: "Street 9",
            city: "Ljubljana",
            country: "SI",
            latitude: 46.056,
            longitude: 14.505,
            checkin_time: "14:00:00",
            checkout_time: "11:00:00",
            cancellation_policy_days: 1,
            is_active: true,
            created_at: nowISO(),
            updated_at: nowISO()
        },
    ];


    const manager_hotels: ManagerHotel[] = [
        {manager_id: 1, hotel_id: 1},
        {manager_id: 2, hotel_id: 2},
    ];


    const hotel_photos: HotelPhoto[] = [
        {id: 1, hotel_id: 1, url: img.alpine, is_cover: true, sort_order: 0, created_at: nowISO()},
        {id: 2, hotel_id: 1, url: img.spa, is_cover: false, sort_order: 1, created_at: nowISO()},
        {id: 3, hotel_id: 2, url: img.coast, is_cover: true, sort_order: 0, created_at: nowISO()},
        {id: 4, hotel_id: 2, url: img.room, is_cover: false, sort_order: 1, created_at: nowISO()},
        {id: 5, hotel_id: 3, url: img.city, is_cover: true, sort_order: 0, created_at: nowISO()},
    ];


    const room_types: RoomType[] = [
        {
            id: 1,
            hotel_id: 1,
            name: "Standard Double",
            description: "Queen bed, mountain view.",
            capacity: 2,
            base_price: 110,
            currency: "EUR",
            total_rooms: 20,
            created_at: nowISO(),
            updated_at: nowISO()
        },
        {
            id: 2,
            hotel_id: 1,
            name: "Junior Suite",
            description: "Lounge area, balcony.",
            capacity: 3,
            base_price: 180,
            currency: "EUR",
            total_rooms: 8,
            created_at: nowISO(),
            updated_at: nowISO()
        },
        {
            id: 3,
            hotel_id: 2,
            name: "Sea View King",
            description: "King bed, balcony sea view.",
            capacity: 2,
            base_price: 150,
            currency: "EUR",
            total_rooms: 25,
            created_at: nowISO(),
            updated_at: nowISO()
        },
        {
            id: 4,
            hotel_id: 3,
            name: "Economy Twin",
            description: "Two single beds.",
            capacity: 2,
            base_price: 75,
            currency: "EUR",
            total_rooms: 15,
            created_at: nowISO(),
            updated_at: nowISO()
        },
    ];


// generate simple 14-day inventory window
    const inventory: RoomInventory[] = [];
    let invId = 1;
    for (let offset = 0; offset < 14; offset++) {
        const date = new Date();
        date.setDate(date.getDate() + offset);
        const d = date.toISOString().slice(0, 10);
        for (const rt of room_types) {
            const seasonalBump = (offset % 7 === 5) ? 1.15 : 1; // slight weekend bump
            inventory.push({
                id: invId++,
                room_type_id: rt.id,
                date: d,
                available_rooms: Math.max(0, Math.floor(rt.total_rooms * (0.5 + Math.random() * 0.5))),
                price_override: Math.random() > 0.75 ? Math.round(rt.base_price * seasonalBump * (0.9 + Math.random() * 0.4)) : null,
                min_stay_nights: Math.random() > 0.9 ? 2 : null,
            })
        }
    }

    const reservations: Reservation[] = [
        { id: 1, user_id: 1, hotel_id: 1, check_in: iso(daysFromNow(3)), check_out: iso(daysFromNow(6)), status: "confirmed", total_price: 330, currency: "EUR", cancellation_deadline: iso(daysFromNow(1)), confirmation_sent_at: nowISO(), created_at: nowISO(), updated_at: nowISO() },
        { id: 2, user_id: 2, hotel_id: 2, check_in: iso(daysFromNow(10)), check_out: iso(daysFromNow(12)), status: "pending", total_price: 300, currency: "EUR", cancellation_deadline: iso(daysFromNow(7)), created_at: nowISO(), updated_at: nowISO() },
    ];


    const reservation_items: ReservationItem[] = [
        { id: 1, reservation_id: 1, room_type_id: 1, quantity: 1, price_per_night: 110, nights: 3, line_total: 330 },
        { id: 2, reservation_id: 2, room_type_id: 3, quantity: 1, price_per_night: 150, nights: 2, line_total: 300 },
    ];


    const reservation_status_history: ReservationStatusHistory[] = [
        { id: 1, reservation_id: 1, changed_by_role: "manager", changed_by_id: 1, old_status: "pending", new_status: "confirmed", note: "Auto-confirmed", created_at: nowISO() },
        { id: 2, reservation_id: 2, changed_by_role: "system", changed_by_id: null, old_status: "pending", new_status: "pending", note: "Awaiting manager review", created_at: nowISO() },
    ];


    const reviews: Review[] = [
        { id: 1, hotel_id: 1, user_id: 1, rating: 5, comment: "Magical lake views.", created_at: nowISO(), is_public: true },
        { id: 2, hotel_id: 1, user_id: 2, rating: 4, comment: "Great spa.", created_at: nowISO(), is_public: true },
        { id: 3, hotel_id: 1, user_id: 3, rating: 5, comment: "Super cozy.", created_at: nowISO(), is_public: true },
        { id: 4, hotel_id: 2, user_id: 1, rating: 4, comment: "Rooftop pool ftw.", created_at: nowISO(), is_public: true },
        { id: 5, hotel_id: 3, user_id: 2, rating: 3, comment: "Basic but central.", created_at: nowISO(), is_public: true },
    ];


    const favorites: Favorite[] = [
        { user_id: 1, hotel_id: 1, created_at: nowISO() },
    ];


    const notifications: Notification[] = [
        { id: 1, user_id: 1, type: "email", template: "booking_confirmed", payload_json: { reservationId: 1 }, scheduled_at: nowISO(), sent_at: nowISO(), status: "sent" },
        { id: 2, user_id: 2, type: "email", template: "booking_pending", payload_json: { reservationId: 2 }, scheduled_at: nowISO(), sent_at: null, status: "scheduled" },
    ];


    return {
        users,
        email_verifications,
        admins,
        managers,
        manager_hotels,
        hotels,
        hotel_photos,
        room_types,
        room_inventory: inventory,
        reservations,
        reservation_items,
        reservation_status_history,
        reviews,
        favorites,
        notifications,
    };
})();
