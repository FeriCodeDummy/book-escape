"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, User2, Mail, Plus, Hotel } from "lucide-react";

// Assumes you expose this hook in your app
// Returns: { managerId: number | null, user?: { name: string; email: string } }
import { useAuth } from "@/context/useAuth";

type ID = number;

type HotelRow = {
    id: ID;
    name: string;
    city: string;
    country: string;
    is_active?: 0 | 1;
    checkin_time?: string | null;
    checkout_time?: string | null;
    cover_url?: string | null; // optional if you extend API to bring cover
};

export default function ManagerDashboardPage() {
    const router = useRouter();
    const { managerId, name, surname, email } = useAuth();

    const [hotels, setHotels] = React.useState<HotelRow[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        (async () => {
            if (!managerId) return; // not logged in as manager
            try {
                setLoading(true);
                // Backend should support manager filter: joins manager_hotels
                const res = await fetch(`/api/hotels?managerId=${managerId}&fields=id,name,city,country,is_active,checkin_time,checkout_time`);
                if (!res.ok) throw new Error("Failed to load your hotels");
                const rows = await res.json();
                setHotels(rows);
            } catch (e) {
                setError((e as Error).message || "Error loading hotels");
            } finally {
                setLoading(false);
            }
        })();
    }, [managerId]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white text-neutral-800">
            <div className="mx-auto max-w-7xl px-4 py-6">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-neutral-900" />
                        <span className="text-lg font-bold tracking-tight">BookEscape</span>
                        <span className="ml-3 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"><Building2 className="h-3.5 w-3.5"/> Manager</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/create-listing" className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50">
                            <Plus className="h-4 w-4"/> New hotel
                        </Link>
                    </div>
                </header>
            </div>

            <main className="mx-auto max-w-7xl px-4 pb-12">
                {/* Manager card */}
                <section className="rounded-2xl border bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-white"><User2 className="h-5 w-5"/></div>
                            <div>
                                <div className="text-base font-semibold">{name} {surname}</div>
                                <div className="inline-flex items-center gap-1 text-sm text-neutral-600"><Mail className="h-4 w-4"/>{email }</div>
                            </div>
                        </div>
                        {managerId ? (
                            <div className="rounded-full border px-2 py-0.5 text-xs">Manager ID: {managerId}</div>
                        ) : (
                            <div className="rounded-full border px-2 py-0.5 text-xs text-rose-600">No manager session</div>
                        )}
                    </div>
                </section>

                {/* Hotels grid */}
                <section className="mt-6">
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-base font-semibold">Your hotels</h2>
                        {loading && <div className="text-sm">Loading…</div>}
                    </div>

                    {error && <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700">{error}</div>}

                    {hotels.length === 0 && !loading ? (
                        <div className="rounded-2xl border bg-white p-6 text-sm">No hotels yet. Click <span className="font-medium">New hotel</span> to create one.</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {hotels.map(h => (
                                <button
                                    key={h.id}
                                    onClick={() => router.push(`/manager/hotels/${h.id}`)}
                                    className="group overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition hover:shadow-md"
                                >
                                    <div className="aspect-[16/9] w-full bg-neutral-100" />
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="text-base font-semibold">{h.name}</div>
                                                <div className="text-xs text-neutral-600">{h.city}, {h.country}</div>
                                            </div>
                                            <div className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"><Hotel className="h-3.5 w-3.5"/>#{h.id}</div>
                                        </div>
                                        <div className="mt-3 text-xs text-neutral-600">Check-in {h.checkin_time ?? "—"} · Check-out {h.checkout_time ?? "—"}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
