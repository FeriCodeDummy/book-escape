export type LoginReturnBody = {
    id?: number
    name?: string
    surname?: string
    email?: string
    error?: string
}

export type ID = number;


// Core auth
export type User = { id: ID; email: string; password_hash: string; is_verified: boolean; status: "active"|"blocked"; created_at: string; updated_at: string };


// Email verification
export type EmailVerification = { id: ID; user_id: ID; token: string; expires_at: string; used_at: string | null; created_at: string };


// Admins (separate from users)
export type Admin = { id: ID; email: string; password_hash: string; status: "active"|"disabled"; otp_secret?: string | null; created_at: string; updated_at: string };


// Managers
export type Manager = { id: ID; email: string; password_hash: string; name?: string | null; phone?: string | null; status: "active"|"blocked"; created_at: string; updated_at: string };


export type ManagerHotel = { manager_id: ID; hotel_id: ID };


// Hotels & content
export type Hotel = {
    id: ID; name: string; description?: string | null; address_line?: string | null;
    city: string; country: string; latitude?: number | null; longitude?: number | null;
    checkin_time?: string | null; checkout_time?: string | null; cancellation_policy_days: number;
    is_active: boolean; created_at: string; updated_at: string
};


export type HotelPhoto = { id: ID; hotel_id: ID; url: string; is_cover: boolean; sort_order: number; created_at: string };


// Rooms / pricing / inventory
export type RoomType = {
    id: ID; hotel_id: ID; name: string; description?: string | null; capacity: number;
    base_price: number; currency: string; total_rooms: number; created_at: string; updated_at: string
};


export type RoomInventory = {
    id: ID; room_type_id: ID; date: string; available_rooms: number; price_override?: number | null; min_stay_nights?: number | null
};


// Bookings
export type Reservation = {
    id: ID; user_id: ID; hotel_id: ID; check_in: string; check_out: string; status: "pending"|"confirmed"|"declined"|"cancelled"|"expired";
    total_price: number; currency: string; cancellation_deadline: string; cancelled_at?: string | null;
    confirmation_sent_at?: string | null; created_at: string; updated_at: string
};


export type ReservationItem = { id: ID; reservation_id: ID; room_type_id: ID; quantity: number; price_per_night: number; nights: number; line_total: number };


export type ReservationStatusHistory = {
    id: ID; reservation_id: ID; changed_by_role: "system"|"manager"|"user"|"admin"; changed_by_id?: ID | null;
    old_status?: string | null; new_status: string; note?: string | null; created_at: string
};


// Reviews
export type Review = { id: ID; hotel_id: ID; user_id: ID; rating: 1|2|3|4|5; comment?: string | null; created_at: string; is_public: boolean };


// Favorites
export type Favorite = { user_id: ID; hotel_id: ID; created_at: string };


// Notifications / email queue
export type Notification = {
    id: ID; user_id: ID; type: "email"; template: "verify_email"|"booking_confirmed"|"booking_pending"|"booking_declined"|"booking_cancelled"|"arrival_reminder";
    payload_json?: Record<string, unknown> | null; scheduled_at: string; sent_at?: string | null; status: "scheduled"|"sent"|"failed"
};

