"use client"

import {AuthProvider} from "@/context/useAuth";
import React, {useMemo, useState} from "react";
import {db} from "@/lib/data/db";
import {ID} from "@/types/commons";
import {Calendar, ChevronRight, MapPin, Search, SlidersHorizontal, Users} from "lucide-react";
import { HotelCard } from "@/components/HotelCard";

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium text-neutral-700 bg-white/60 backdrop-blur-sm shadow-sm">
{children}
</span>
);

export default function Home() {
    const [query, setQuery] = useState("");
    const [checkIn, setCheckIn] = useState<string>("");
    const [checkOut, setCheckOut] = useState<string>("");
    const [guests, setGuests] = useState<number>(2);
    const [maxPrice, setMaxPrice] = useState<number>(300);
    const [favorites, setFavorites] = useState<Set<ID>>(new Set(db.favorites.filter(f => f.user_id === 1).map(f => f.hotel_id)));

    function getHotelCoverPhoto(hotelId: ID): string | null {
        const p = db.hotel_photos.filter(p => p.hotel_id === hotelId).sort((a,b) => (b.is_cover?1:0) - (a.is_cover?1:0) || a.sort_order - b.sort_order)[0];
        return p?.url ?? null;
    }


    function getHotelMinPrice(hotelId: ID): number | null {
        const types = db.room_types.filter(r => r.hotel_id === hotelId);
        if (!types.length) return null;
// For homepage, we just show min base price. (You can enrich with inventory-aware min for a date range later.)
        return Math.min(...types.map(t => t.base_price));
    }


    function getHotelRating(hotelId: ID): { avg: number; count: number } {
        const rs = db.reviews.filter(r => r.hotel_id === hotelId && r.is_public);
        if (!rs.length) return { avg: 0, count: 0 };
        const avg = rs.reduce((acc, r) => acc + r.rating, 0) / rs.length;
        return { avg, count: rs.length };
    }

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return db.hotels
            .filter(h => h.is_active)
            .filter(h => {
                if (!q) return true;
                return (
                    h.name.toLowerCase().includes(q) ||
                    (h.city?.toLowerCase().includes(q)) ||
                    (h.description?.toLowerCase().includes(q))
                );
            })
            .filter(h => {
                const min = getHotelMinPrice(h.id);
                return min === null ? false : min <= maxPrice;
            })
            .sort((a,b) => (getHotelMinPrice(a.id) ?? 99999) - (getHotelMinPrice(b.id) ?? 99999));
    }, [query, maxPrice]);


    const toggleFav = (hotelId: ID) => {
        setFavorites(prev => {
            const next = new Set(prev);
            if (next.has(hotelId)) next.delete(hotelId); else next.add(hotelId);
            return next;
        });
    };
    return (
    <AuthProvider >
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:py-4">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-neutral-900" />
                        <span className="text-lg font-bold tracking-tight">BookEscape</span>
                    </div>
                    <nav className="hidden gap-6 text-sm text-neutral-700 md:flex">
                        <a className="hover:text-black" href="#explore">Explore</a>
                        <a className="hover:text-black" href="#deals">Deals</a>
                        <a className="hover:text-black" href="#about">About</a>
                    </nav>
                    <div className="flex items-center gap-2">
                        <button className="hidden rounded-xl border px-3 py-1.5 text-sm hover:bg-neutral-50 md:inline-flex">Sign in</button>
                        <button className="rounded-xl bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-800">Create account</button>
                    </div>
                </div>
            </header>

            <section className="relative mx-auto max-w-7xl px-4 pt-8 md:pt-12">
                <div className="relative overflow-hidden rounded-3xl border bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1400&auto=format&fit=crop')] bg-cover bg-center">
                    <div className="bg-gradient-to-r from-black/60 to-black/10 p-6 md:p-10">
                        <h1 className="max-w-2xl text-3xl font-bold leading-tight text-white md:text-4xl">Find the perfect stay for your next trip</h1>
                        <p className="mt-2 max-w-2xl text-white/80">Search by city, pick your dates, and filter by price. Book with instant confirmations.*</p>


                        <div className="mt-5 rounded-2xl bg-white/95 p-3 shadow-lg md:p-4">
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-5 md:gap-3">
                                <div className="relative col-span-2">
                                    <label className="mb-1 block text-xs font-medium text-neutral-600">Where</label>
                                    <div className="flex items-center rounded-xl border bg-white px-3">
                                        <MapPin className="mr-2 h-4 w-4 text-neutral-400" />
                                        <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="City, hotel name" className="h-11 w-full bg-transparent text-sm outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-600">Check in</label>
                                    <div className="flex items-center rounded-xl border bg-white px-3">
                                        <Calendar className="mr-2 h-4 w-4 text-neutral-400" />
                                        <input type="date" value={checkIn} onChange={(e)=>setCheckIn(e.target.value)} className="h-11 w-full bg-transparent text-sm outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-600">Check out</label>
                                    <div className="flex items-center rounded-xl border bg-white px-3">
                                        <Calendar className="mr-2 h-4 w-4 text-neutral-400" />
                                        <input type="date" value={checkOut} onChange={(e)=>setCheckOut(e.target.value)} className="h-11 w-full bg-transparent text-sm outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-600">Guests</label>
                                    <div className="flex items-center rounded-xl border bg-white px-3">
                                        <Users className="mr-2 h-4 w-4 text-neutral-400" />
                                        <input type="number" min={1} value={guests} onChange={(e)=>setGuests(parseInt(e.target.value||'1'))} className="h-11 w-full bg-transparent text-sm outline-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                                        <SlidersHorizontal className="h-4 w-4 text-neutral-500" />
                                        <span>Max price: €{maxPrice}</span>
                                        <input type="range" min={50} max={500} value={maxPrice} onChange={(e)=>setMaxPrice(parseInt(e.target.value))} className="h-1.5 w-40 cursor-pointer appearance-none rounded-full bg-neutral-200" />
                                    </div>
                                    {checkIn && checkOut ? (
                                        <Badge>
                                            <Calendar className="mr-1 h-3.5 w-3.5" />
                                            {checkIn} → {checkOut}
                                        </Badge>
                                    ) : null}
                                </div>
                                <button className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800">
                                    <Search className="h-4 w-4" /> Search
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="explore" className="mx-auto max-w-7xl px-4 py-8 md:py-12">
                <div className="mb-4 flex items-end justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">Explore stays</h2>
                        <p className="text-sm text-neutral-600">{filtered.length} place{filtered.length !== 1 ? 's' : ''} found</p>
                    </div>
                    <div className="text-sm text-neutral-600">
                        * Confirmations depend on property settings
                    </div>
                </div>


                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map(h => (
                        <HotelCard key={h.id} hotel={h} isFav={favorites.has(h.id)} onToggleFav={toggleFav} />
                    ))}
                </div>
            </section>


            {/* CTA / Footer */}
            <section id="about" className="mx-auto max-w-7xl px-4 pb-12">
                <div className="rounded-3xl border bg-neutral-900 p-8 text-white">
                    <h3 className="text-2xl font-semibold">List your property on BookEscape</h3>
                    <p className="mt-2 max-w-2xl text-white/80">Hotel managers can join for free, manage availability and pricing, and confirm or decline bookings with a click.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge>Real-time availability</Badge>
                        <Badge>Easy pricing overrides</Badge>
                        <Badge>Guest messaging</Badge>
                        <Badge>Secure payouts</Badge>
                    </div>
                    <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-medium text-neutral-900 hover:bg-white/90">
                        Get started <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
                <footer className="mt-10 border-t pt-6 text-sm text-neutral-500">
                    © {new Date().getFullYear()} BookEscape. All rights reserved.
                </footer>
            </section>
        </div>
    </AuthProvider>
        );
}
