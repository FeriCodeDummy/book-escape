"use client"
import React, {useState} from "react";
import {ID} from "@/types/commons";
import {db} from "@/lib/data/db";
import {getHotelRating} from "@/lib/helpers/funcs";
import {MapPin} from "lucide-react";
import StarRating from "@/components/StarRating";
import Badge from "@/components/Badge";


const HotelDetails: React.FC<{ hotelId: ID; onBack: () => void }> = ({ hotelId, onBack }) => {
    const [checkIn, setCheckIn] = useState<string>("");
    const [checkOut, setCheckOut] =useState<string>("");
    const [guests, setGuests] = useState<number>(2);
    const roomTypes = db.room_types.filter(r => r.hotel_id === hotelId);
    const [selectedRoom, setSelectedRoom] = useState<ID | null>(roomTypes[0]?.id ?? null);

    const hotel = db.hotels.find(h => h.id === hotelId);
    if (!hotel) return (
        <div className="mx-auto max-w-7xl px-4 py-10">
            <button onClick={onBack} className="mb-4 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50">← Back</button>
            <div className="rounded-2xl border p-6">Hotel not found.</div>
        </div>
    );


    const photos = db.hotel_photos.filter(p => p.hotel_id === hotelId).sort((a,b)=> a.sort_order-b.sort_order);
    const { avg, count } = getHotelRating(hotelId);





    const curr = roomTypes.find(r => r.id === selectedRoom);
    const price = curr ? curr.base_price : 0;


    const onBook = () => {
        console.log("Booked:", {
            hotelId,
            roomTypeId: selectedRoom,
            checkIn,
            checkOut,
            guests,
            pricePerNight: price,
        });
        alert("(Dev) Booking logged to console");
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <button onClick={onBack} className="mb-4 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50">← Back to results</button>

            {/* Header */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">{hotel.name}</h1>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
                        <MapPin className="h-4 w-4" /> {hotel.address_line ? hotel.address_line + ', ' : ''}{hotel.city}, {hotel.country}
                        <span className="mx-2">·</span>
                        <StarRating value={avg} count={count} />
                    </div>
                </div>
                <div className="text-sm text-neutral-600">
                    Check-in <span className="font-medium text-neutral-900">{hotel.checkin_time ?? '14:00'}</span> · Check-out <span className="font-medium text-neutral-900">{hotel.checkout_time ?? '11:00'}</span>
                </div>
            </div>
            {/* Gallery */}
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {photos.slice(0,1).map(p => (
                    <div key={p.id} className="md:col-span-2 overflow-hidden rounded-2xl">
                        <img src={p.url} alt="Cover" className="h-72 w-full object-cover" />
                    </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                    {photos.slice(1,5).map(p => (
                        <div key={p.id} className="overflow-hidden rounded-2xl">
                            <img src={p.url} alt="Photo" className="h-36 w-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>
            {/* Content */}
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <div className="rounded-2xl border p-5">
                        <h2 className="text-lg font-semibold">About this stay</h2>
                        <p className="mt-2 whitespace-pre-line text-sm text-neutral-700">{hotel.description || 'A lovely place to stay with comfort and style.'}</p>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-xl bg-neutral-50 p-3 text-sm">
                                <div className="font-medium">Cancellation policy</div>
                                <div className="text-neutral-600">Free cancellation up to {hotel.cancellation_policy_days} day(s) before check‑in.</div>
                            </div>
                            <div className="rounded-xl bg-neutral-50 p-3 text-sm">
                                <div className="font-medium">Location</div>
                                <div className="text-neutral-600">{hotel.city}, {hotel.country}</div>
                            </div>
                        </div>
                    </div>


                    <div className="mt-6 rounded-2xl border p-5">
                        <h3 className="text-lg font-semibold">Guest reviews</h3>
                        <div className="mt-2 flex items-center gap-2">
                            <StarRating value={avg} count={count} />
                        </div>
                        <div className="mt-4 space-y-3">
                            {db.reviews.filter(r => r.hotel_id === hotelId && r.is_public).slice(0,3).map(r => (
                                <div key={r.id} className="rounded-xl border p-3">
                                    <div className="text-sm font-medium">{db.users.find(u => u.id === r.user_id)?.email.replace(/@.*/, '')}</div>
                                    <div className="text-xs text-neutral-500">{new Date(r.created_at).toLocaleDateString()}</div>
                                    <div className="mt-1 text-sm">{r.comment}</div>
                                </div>
                            ))}
                            {count < 3 && (
                                <div className="text-sm text-neutral-500">Be the first to leave a review.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Booking widget */}
                <aside className="md:col-span-1">
                    <div className="sticky top-20 rounded-2xl border p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="text-sm text-neutral-500">From</div>
                                <div className="text-2xl font-bold">€{Math.min(...roomTypes.map(r=>r.base_price))}</div>
                                <div className="text-xs text-neutral-500">per night</div>
                            </div>
                            <Badge>{hotel.city}</Badge>
                        </div>


                        <div className="mt-4 space-y-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-neutral-600">Room type</label>
                                <select value={selectedRoom ?? ''} onChange={(e)=>setSelectedRoom(Number(e.target.value))} className="h-11 w-full rounded-xl border px-3 text-sm">
                                    {roomTypes.map(rt => (
                                        <option key={rt.id} value={rt.id}>{rt.name} · up to {rt.capacity} guests · €{rt.base_price}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-600">Check in</label>
                                    <input type="date" value={checkIn} onChange={(e)=>setCheckIn(e.target.value)} className="h-11 w-full rounded-xl border px-3 text-sm"/>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-600">Check out</label>
                                    <input type="date" value={checkOut} onChange={(e)=>setCheckOut(e.target.value)} className="h-11 w-full rounded-xl border px-3 text-sm"/>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-neutral-600">Guests</label>
                                <input type="number" min={1} value={guests} onChange={(e)=>setGuests(parseInt(e.target.value||'1'))} className="h-11 w-full rounded-xl border px-3 text-sm"/>
                            </div>
                            <button onClick={onBook} className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800">Book now</button>
                            <div className="text-xs text-neutral-500">You won't be charged yet</div>
                        </div>


                        <div className="mt-4 divide-y rounded-xl border">
                            {roomTypes.map(rt => (
                                <div key={rt.id} className="flex items-center justify-between p-3 text-sm">
                                    <div>
                                        <div className="font-medium">{rt.name}</div>
                                        <div className="text-xs text-neutral-500">Sleeps {rt.capacity}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">€{rt.base_price}</div>
                                        <div className="text-xs text-neutral-500">/ night</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}