"use client";
import React from "react";
import { Building2, CalendarCheck2, ChevronRight, Clock4, Plus, Trash2, Users, Euro, CheckCircle2 } from "lucide-react";
import {useAuth} from "@/context/useAuth";

// BookEscape — Manager Create Flow (Hotel -> Rooms)
// Dark text for readability (text-neutral-800)
// Hooks real endpoints: POST /api/hotels, GET /api/rooms?hotelId=..., POST /api/rooms

// ————————————————— Types —————————————————
type ID = number;

type HotelPayload = {
    name: string;
    description?: string | null;
    address_line?: string | null;
    city: string;
    country: string;               // ISO-2 (e.g., "SI")
    checkin_time?: string | null;  // "14:00"
    checkout_time?: string | null; // "11:00"
    cancellation_policy_days?: number; // default 1
    is_active?: 1 | 0;
    manager_id?: ID | null;        // optional if you link managers
};

type RoomType = {
    id: ID;
    hotel_id: ID;
    name: string;
    description?: string | null;
    capacity: number;
    base_price: number;
    currency: string; // e.g., EUR
    total_rooms: number;
};

type RoomDraft = Omit<RoomType, "id" | "hotel_id">;

// ————————————————— UI —————————————————
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border bg-white shadow-2xl text-neutral-800">
                {children}
            </div>
        </div>
    );
}

export default function ManagerCreateHotelFinal() {
    const [step, setStep] = React.useState<1 | 2>(1);
    const [error, setError] = React.useState<string | null>(null);
    const [submitting, setSubmitting] = React.useState(false);
    const {managerId} = useAuth();
    // Step 1: Hotel form
    const [hotel, setHotel] = React.useState<HotelPayload>({
        name: "",
        description: "",
        address_line: "",
        city: "",
        country: "SI",
        checkin_time: "14:00",
        checkout_time: "11:00",
        cancellation_policy_days: 1,
        is_active: 1,
        manager_id: managerId,
    });
    const [hotelId, setHotelId] = React.useState<ID | null>(null);

    const canSubmitHotel = Boolean(hotel.name.trim() && hotel.city.trim() && hotel.country.trim());

    async function handleCreateHotel() {
        try {
            setSubmitting(true);
            setError(null);
            const res = await fetch("/api/hotels", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(hotel),
            });
            if (!res.ok) throw new Error(`Create hotel failed (${res.status})`);
            const created = await res.json();
            setHotelId(created.id);
            // Load any existing rooms (should be none on fresh create, but supports resume)
            await fetchRooms(created.id);
            setStep(2);
        } catch (e) {
            setError((e as Error).message || "Failed to create hotel");
        } finally {
            setSubmitting(false);
        }
    }

    // Step 2: Rooms
    const [rooms, setRooms] = React.useState<RoomType[]>([]);
    const [addingRoom, setAddingRoom] = React.useState(false);
    const [roomDraft, setRoomDraft] = React.useState<RoomDraft>({
        name: "",
        description: "",
        capacity: 2,
        base_price: 100,
        currency: "EUR",
        total_rooms: 5,
    });

    async function fetchRooms(hId: ID) {
        try {
            const r = await fetch(`/api/rooms?hotelId=${hId}`);
            if (!r.ok) throw new Error("Failed to load rooms");
            const data = await r.json();
            setRooms(data);
        } catch (e) {
            setError((e as Error).message || "Failed to load rooms");
        }
    }

    async function handleAddRoom() {
        if (!hotelId) return;
        setError(null);
        try {
            const payload = { hotel_id: hotelId, ...roomDraft };
            const resp = await fetch("/api/rooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!resp.ok) throw new Error(`Create room failed (${resp.status})`);
            const created = await resp.json();
            setRooms(prev => [created, ...prev]);
            setAddingRoom(false);
            // reset draft lightly
            setRoomDraft(d => ({ ...d, name: "", description: "" }));
        } catch (e) {
            setError((e as Error).message || "Failed to create room");
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white text-neutral-800">
            {/* Header */}
            <div className="mx-auto max-w-7xl px-4 py-6">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-neutral-900" />
                        <span className="text-lg font-bold tracking-tight">BookEscape</span>
                        <span className="ml-3 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs">Manager · Create a Hotel</span>
                    </div>
                    <a href="/manager" className="text-sm hover:underline">Back to dashboard</a>
                </header>
            </div>

            <main className="mx-auto max-w-7xl px-4 pb-12">
                {/* Steps */}
                <div className="mb-4 flex items-center gap-2 text-sm">
                    <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${step===1?"bg-neutral-900 text-white":"border"}`}>
                        <Building2 className="h-4 w-4"/> 1. Hotel details
                    </div>
                    <ChevronRight className="h-4 w-4"/>
                    <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${step===2?"bg-neutral-900 text-white":"border"}`}>
                        <CalendarCheck2 className="h-4 w-4"/> 2. Rooms & pricing
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700">{error}</div>
                )}

                {/* Step 1 — Create hotel */}
                {step === 1 && (
                    <section className="rounded-2xl border bg-white p-6 shadow-sm">
                        <h1 className="text-xl font-semibold">Create a new hotel</h1>
                        <p className="mt-1 text-sm">Fill in property details. You will add rooms in the next step.</p>

                        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-medium">Hotel name</label>
                                <input value={hotel.name} onChange={(e)=>setHotel(h=>({...h, name: e.target.value}))} className="h-11 w-full rounded-xl border px-3 text-sm" placeholder="e.g., Alpine Meadow Lodge"/>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium">City</label>
                                <input value={hotel.city} onChange={(e)=>setHotel(h=>({...h, city: e.target.value}))} className="h-11 w-full rounded-xl border px-3 text-sm" placeholder="e.g., Ljubljana"/>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium">Country (ISO-2)</label>
                                <input value={hotel.country} onChange={(e)=>setHotel(h=>({...h, country: e.target.value.toUpperCase().slice(0,2)}))} className="h-11 w-full rounded-xl border px-3 text-sm" placeholder="SI"/>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium">Address</label>
                                <input value={hotel.address_line ?? ""} onChange={(e)=>setHotel(h=>({...h, address_line: e.target.value}))} className="h-11 w-full rounded-xl border px-3 text-sm" placeholder="Street 1"/>
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-xs font-medium">Description</label>
                                <textarea value={hotel.description ?? ""} onChange={(e)=>setHotel(h=>({...h, description: e.target.value}))} className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm" placeholder="Short description of your property"/>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium">Check-in time</label>
                                <div className="flex items-center rounded-xl border px-3">
                                    <Clock4 className="mr-2 h-4 w-4"/>
                                    <input type="time" value={hotel.checkin_time ?? ''} onChange={(e)=>setHotel(h=>({...h, checkin_time: e.target.value}))} className="h-11 w-full bg-transparent text-sm outline-none"/>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium">Check-out time</label>
                                <div className="flex items-center rounded-xl border px-3">
                                    <Clock4 className="mr-2 h-4 w-4"/>
                                    <input type="time" value={hotel.checkout_time ?? ''} onChange={(e)=>setHotel(h=>({...h, checkout_time: e.target.value}))} className="h-11 w-full bg-transparent text-sm outline-none"/>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium">Cancellation policy (days)</label>
                                <input type="number" min={0} value={hotel.cancellation_policy_days ?? 1} onChange={(e)=>setHotel(h=>({...h, cancellation_policy_days: Number(e.target.value||1)}))} className="h-11 w-full rounded-xl border px-3 text-sm"/>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-2">
                            <button className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-50" onClick={()=>setHotel({
                                name: "",
                                description: "",
                                address_line: "",
                                city: "",
                                country: "SI",
                                checkin_time: "14:00",
                                checkout_time: "11:00",
                                cancellation_policy_days: 1,
                                is_active: 1,
                                manager_id: managerId
                            })}>Reset</button>
                            <button disabled={!canSubmitHotel || submitting} onClick={handleCreateHotel} className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60">
                                Create hotel
                            </button>
                        </div>
                    </section>
                )}

                {/* Step 2 — Add Rooms */}
                {step === 2 && (
                    <section className="rounded-2xl border bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-semibold">Add rooms & pricing</h1>
                                <p className="mt-1 text-sm">Create the room types available in this property.</p>
                                {hotelId && (
                                    <div className="mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs">Hotel ID: {hotelId}</div>
                                )}
                            </div>
                            <button onClick={()=>setAddingRoom(true)} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50">
                                <Plus className="h-4 w-4"/> New room type
                            </button>
                        </div>

                        {/* Current room list */}
                        <div className="mt-5 divide-y rounded-2xl border">
                            {rooms.length === 0 && (
                                <div className="p-4 text-sm">No rooms added yet. Click <span className="font-medium">New room type</span> to add one.</div>
                            )}
                            {rooms.map((r) => (
                                <div key={r.id} className="grid grid-cols-12 items-center gap-3 p-4 text-sm">
                                    <div className="col-span-5">
                                        <div className="font-medium">{r.name}</div>
                                        <div className="text-xs text-neutral-600 line-clamp-1">{r.description}</div>
                                    </div>
                                    <div className="col-span-2 inline-flex items-center gap-1"><Users className="h-4 w-4"/> {r.capacity}</div>
                                    <div className="col-span-2">€{r.base_price} <span className="text-xs text-neutral-600">/night</span></div>
                                    <div className="col-span-2">{r.total_rooms} unit{r.total_rooms!==1?"s":""}</div>
                                    <div className="col-span-1 text-right">
                                        <button className="rounded-lg border px-2 py-1 text-rose-600 hover:bg-rose-50" onClick={()=>alert('TODO: DELETE /api/rooms/[id]')}><Trash2 className="h-4 w-4"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <a href={`/manager/hotels/${hotelId ?? ''}`} className="inline-flex items-center gap-2 text-sm hover:underline">
                                <CheckCircle2 className="h-4 w-4"/> Done for now — go to hotel
                            </a>
                            <div className="text-xs text-neutral-600">Rooms are saved when you click “New room type → Add”.</div>
                        </div>
                    </section>
                )}
            </main>

            {/* Add Room Modal */}
            <Modal open={addingRoom} onClose={()=>setAddingRoom(false)}>
                <div className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">New room type</h3>
                        <button onClick={()=>setAddingRoom(false)} className="rounded-lg px-2 py-1 text-sm hover:bg-neutral-50">Close</button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <label className="mb-1 block text-xs font-medium">Name</label>
                            <input value={roomDraft.name} onChange={(e)=>setRoomDraft(d=>({...d, name: e.target.value}))} className="h-11 w-full rounded-xl border px-3 text-sm" placeholder="e.g., Family Apartment"/>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium">Description</label>
                            <textarea value={roomDraft.description ?? ""} onChange={(e)=>setRoomDraft(d=>({...d, description: e.target.value}))} className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm"/>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium">Capacity</label>
                                <input type="number" min={1} value={roomDraft.capacity} onChange={(e)=>setRoomDraft(d=>({...d, capacity: Number(e.target.value||1)}))} className="h-11 w-full rounded-xl border px-3 text-sm"/>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium">Base price (€)</label>
                                <input type="number" min={1} value={roomDraft.base_price} onChange={(e)=>setRoomDraft(d=>({...d, base_price: Number(e.target.value||1)}))} className="h-11 w-full rounded-xl border px-3 text-sm"/>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium">Total units</label>
                                <input type="number" min={1} value={roomDraft.total_rooms} onChange={(e)=>setRoomDraft(d=>({...d, total_rooms: Number(e.target.value||1)}))} className="h-11 w-full rounded-xl border px-3 text-sm"/>
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium">Currency</label>
                            <input value={roomDraft.currency} onChange={(e)=>setRoomDraft(d=>({...d, currency: e.target.value}))} className="h-11 w-full rounded-xl border px-3 text-sm"/>
                        </div>
                    </div>

                    <div className="mt-5 flex items-center justify-end gap-2">
                        <button onClick={()=>setAddingRoom(false)} className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-50">Cancel</button>
                        <button onClick={handleAddRoom} disabled={!hotelId || !roomDraft.name.trim()} className="rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60">Add room</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
