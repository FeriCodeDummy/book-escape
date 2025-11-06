"use client";
import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Users, Euro, Hotel, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/useAuth";

type ID = number;

type HotelInfo = {
    id: ID;
    name: string;
    city: string;
    country: string;
    description?: string | null;
    checkin_time?: string | null;
    checkout_time?: string | null;
};

type RoomType = {
    id: ID;
    hotel_id: ID;
    name: string;
    description?: string | null;
    capacity: number;
    base_price: number;
    currency: string;
    total_rooms: number;
};

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border bg-white p-5 shadow-2xl text-neutral-800">
                {children}
            </div>
        </div>
    );
}

export default function ManagerHotelDetailPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const hotelId = Number(params.id);
    const { managerId } = useAuth();

    const [hotel, setHotel] = React.useState<HotelInfo | null>(null);
    const [rooms, setRooms] = React.useState<RoomType[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [showCreate, setShowCreate] = React.useState(false);
    const [showEdit, setShowEdit] = React.useState<RoomType | null>(null);
    const [deleteId, setDeleteId] = React.useState<ID | null>(null);

    // Draft state for create/edit
    const emptyDraft = { name: "", description: "", capacity: 2, base_price: 100, currency: "EUR", total_rooms: 5 };
    const [draft, setDraft] = React.useState<typeof emptyDraft>(emptyDraft);

    React.useEffect(() => {
        if (!hotelId) return;
        (async () => {
            try {
                setLoading(true);
                const [hRes, rRes] = await Promise.all([
                    fetch(`/api/hotels/${hotelId}`),
                    fetch(`/api/rooms?hotelId=${hotelId}`)
                ]);
                if (!hRes.ok) throw new Error("Failed to load hotel");
                if (!rRes.ok) throw new Error("Failed to load rooms");
                setHotel(await hRes.json());
                setRooms(await rRes.json());
            } catch (e) {
                setError((e as Error).message || "Load error");
            } finally {
                setLoading(false);
            }
        })();
    }, [hotelId]);

    function startCreate() {
        setDraft(emptyDraft);
        setShowCreate(true);
    }

    function startEdit(room: RoomType) {
        setDraft({
            name: room.name,
            description: room.description ?? "",
            capacity: room.capacity,
            base_price: room.base_price,
            currency: room.currency,
            total_rooms: room.total_rooms,
        });
        setShowEdit(room);
    }

    async function createRoom() {
        try {
            const resp = await fetch("/api/rooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hotel_id: hotelId, ...draft }),
            });
            if (!resp.ok) throw new Error("Create failed");
            const created = await resp.json();
            setRooms(prev => [created, ...prev]);
            setShowCreate(false);
        } catch (e) {
            alert((e as Error).message || "Failed to create");
        }
    }

    async function updateRoom() {
        if (!showEdit) return;
        try {
            const resp = await fetch(`/api/rooms/${showEdit.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(draft),
            });
            if (!resp.ok) throw new Error("Update failed");
            const updated = await resp.json();
            setRooms(prev => prev.map(r => (r.id === updated.id ? updated : r)));
            setShowEdit(null);
        } catch (e) {
            alert((e as Error).message || "Failed to update");
        }
    }

    async function deleteRoom() {
        if (!deleteId) return;
        try {
            const resp = await fetch(`/api/rooms/${deleteId}`, { method: "DELETE" });
            if (!resp.ok) throw new Error("Delete failed");
            setRooms(prev => prev.filter(r => r.id !== deleteId));
            setDeleteId(null);
        } catch (e) {
            alert((e as Error).message || "Failed to delete");
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white text-neutral-800">
            <div className="mx-auto max-w-7xl px-4 py-6">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/manager" className="inline-flex items-center gap-2 rounded-xl border px-2 py-1 text-sm hover:bg-neutral-50"><ArrowLeft className="h-4 w-4"/> Back</Link>
                        <span className="text-lg font-bold tracking-tight">BookEscape</span>
                    </div>
                </header>
            </div>

            <main className="mx-auto max-w-7xl px-4 pb-12">
                {loading && <div>Loading…</div>}
                {error && <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700">{error}</div>}

                {hotel && (
                    <section className="rounded-2xl border bg-white p-6 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h1 className="text-xl font-semibold">{hotel.name}</h1>
                                <div className="text-sm text-neutral-600">{hotel.city}, {hotel.country}</div>
                                <div className="mt-2 text-sm text-neutral-700">Check-in {hotel.checkin_time ?? "—"} · Check-out {hotel.checkout_time ?? "—"}</div>
                            </div>
                            <div className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"><Hotel className="h-3.5 w-3.5"/>#{hotel.id}</div>
                        </div>
                    </section>
                )}

                {/* Rooms CRUD */}
                <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-base font-semibold">Rooms</h2>
                        <button onClick={startCreate} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50"><Plus className="h-4 w-4"/> New room type</button>
                    </div>

                    <div className="overflow-hidden rounded-2xl border">
                        <div className="grid grid-cols-12 gap-2 border-b bg-neutral-50 px-4 py-2 text-xs font-medium">
                            <div className="col-span-4">Room</div>
                            <div className="col-span-2">Capacity</div>
                            <div className="col-span-2">Base price</div>
                            <div className="col-span-2">Total units</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>
                        {rooms.map(r => (
                            <div key={r.id} className="grid grid-cols-12 items-center gap-2 px-4 py-3 text-sm hover:bg-neutral-50">
                                <div className="col-span-4">
                                    <div className="font-medium">{r.name}</div>
                                    <div className="text-xs text-neutral-600 line-clamp-1">{r.description}</div>
                                </div>
                                <div className="col-span-2 inline-flex items-center gap-1"><Users className="h-4 w-4"/> {r.capacity}</div>
                                <div className="col-span-2">€{r.base_price}</div>
                                <div className="col-span-2">{r.total_rooms}</div>
                                <div className="col-span-2 text-right">
                                    <button onClick={()=>startEdit(r)} className="mr-2 rounded-lg border px-2 py-1 hover:bg-neutral-50"><Pencil className="h-4 w-4"/></button>
                                    <button onClick={()=>setDeleteId(r.id)} className="rounded-lg border px-2 py-1 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4"/></button>
                                </div>
                            </div>
                        ))}
                        {rooms.length === 0 && !loading && (
                            <div className="p-4 text-sm">No rooms yet. Use “New room type”.</div>
                        )}
                    </div>
                </section>
            </main>

            {/* Create Modal */}
            <Modal open={showCreate} onClose={()=>setShowCreate(false)}>
                <h3 className="text-lg font-semibold">New room type</h3>
                <div className="mt-3 grid grid-cols-1 gap-3">
                    <label className="text-xs font-medium">Name
                        <input className="mt-1 h-11 w-full rounded-xl border px-3 text-sm" value={draft.name} onChange={e=>setDraft(d=>({...d, name: e.target.value}))}/>
                    </label>
                    <label className="text-xs font-medium">Description
                        <textarea className="mt-1 min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm" value={draft.description} onChange={e=>setDraft(d=>({...d, description: e.target.value}))}/>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        <label className="text-xs font-medium">Capacity
                            <input type="number" min={1} className="mt-1 h-11 w-full rounded-xl border px-3 text-sm" value={draft.capacity} onChange={e=>setDraft(d=>({...d, capacity: Number(e.target.value||1)}))}/>
                        </label>
                        <label className="text-xs font-medium">Base price (€)
                            <input type="number" min={1} className="mt-1 h-11 w-full rounded-xl border px-3 text-sm" value={draft.base_price} onChange={e=>setDraft(d=>({...d, base_price: Number(e.target.value||1)}))}/>
                        </label>
                        <label className="text-xs font-medium">Total units
                            <input type="number" min={1} className="mt-1 h-11 w-full rounded-xl border px-3 text-sm" value={draft.total_rooms} onChange={e=>setDraft(d=>({...d, total_rooms: Number(e.target.value||1)}))}/>
                        </label>
                    </div>
                    <label className="text-xs font-medium">Currency
                        <input className="mt-1 h-11 w-full rounded-xl border px-3 text-sm" value={draft.currency} onChange={e=>setDraft(d=>({...d, currency: e.target.value}))}/>
                    </label>
                </div>
                <div className="mt-5 flex items-center justify-end gap-2">
                    <button onClick={()=>setShowCreate(false)} className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-50">Cancel</button>
                    <button onClick={createRoom} disabled={!draft.name.trim()} className="rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60">Add room</button>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal open={!!showEdit} onClose={()=>setShowEdit(null)}>
                <h3 className="text-lg font-semibold">Edit room type</h3>
                <div className="mt-3 grid grid-cols-1 gap-3">
                    <label className="text-xs font-medium">Name
                        <input className="mt-1 h-11 w-full rounded-xl border px-3 text-sm" value={draft.name} onChange={e=>setDraft(d=>({...d, name: e.target.value}))}/>
                    </label>
                    <label className="text-xs font-medium">Description
                        <textarea className="mt-1 min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm" value={draft.description} onChange={e=>setDraft(d=>({...d, description: e.target.value}))}/>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        <label className="text-xs font-medium">Capacity
                            <input type="number" min={1} className="mt-1 h-11 w-full rounded-xl border px-3 text-sm" value={draft.capacity} onChange={e=>setDraft(d=>({...d, capacity: Number(e.target.value||1)}))}/>
                        </label>
                        <label className="text-xs font-medium">Base price (€)
                            <input type="number" min={1} className="mt-1 h-11 w-full rounded-xl border px-3 text-sm" value={draft.base_price} onChange={e=>setDraft(d=>({...d, base_price: Number(e.target.value||1)}))}/>
                        </label>
                        <label className="text-xs font-medium">Total units
                            <input type="number" min={1} className="mt-1 h-11 w-full rounded-xl border px-3 text-sm" value={draft.total_rooms} onChange={e=>setDraft(d=>({...d, total_rooms: Number(e.target.value||1)}))}/>
                        </label>
                    </div>
                    <label className="text-xs font-medium">Currency
                        <input className="mt-1 h-11 w-full rounded-xl border px-3 text-sm" value={draft.currency} onChange={e=>setDraft(d=>({...d, currency: e.target.value}))}/>
                    </label>
                </div>
                <div className="mt-5 flex items-center justify-end gap-2">
                    <button onClick={()=>setShowEdit(null)} className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-50">Cancel</button>
                    <button onClick={updateRoom} disabled={!draft.name.trim()} className="rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60">Save</button>
                </div>
            </Modal>

            {/* Delete Confirm */}
            <Modal open={!!deleteId} onClose={()=>setDeleteId(null)}>
                <h3 className="text-lg font-semibold">Delete room?</h3>
                <p className="mt-2 text-sm">This action cannot be undone.</p>
                <div className="mt-5 flex items-center justify-end gap-2">
                    <button onClick={()=>setDeleteId(null)} className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-50">Cancel</button>
                    <button onClick={deleteRoom} className="rounded-xl bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700">Delete</button>
                </div>
            </Modal>
        </div>
    );
}
