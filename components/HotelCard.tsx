import { ChevronRight, Heart, Star} from "lucide-react";
import {Hotel, ID} from "@/types/commons";
import {db} from "@/lib/data/db";
import {useAuth} from "@/context/useAuth";
import {getHotelCoverPhoto, getHotelMinPrice, getHotelRating} from "@/lib/helpers/funcs";
import React from "react";
import Badge from "@/components/Badge";
import StarRating from "@/components/StarRating";
import Link from "next/link";



const HotelCard: React.FC<{
    hotel: Hotel;
    isFav?: boolean;
    onToggleFav?: (hotelId: ID) => void;
    onOpen?: (hotelId: ID) => void;
}> = ({ hotel, isFav, onToggleFav, onOpen }) => {
    const cover = getHotelCoverPhoto(hotel.id);
    const minPrice = getHotelMinPrice(hotel.id);
    const { avg, count } = getHotelRating(hotel.id);


    return (
        <div className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
            <div className="relative aspect-[16/10] w-full overflow-hidden">
                {cover ? (
                    <img src={cover} alt={hotel.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-neutral-100">No image</div>
                )}
                <button
                    onClick={() => onToggleFav && onToggleFav(hotel.id)}
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow hover:bg-white"
                    aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                >
                    <Heart className={`h-5 w-5 ${isFav ? 'fill-current' : ''}`} />
                </button>
                <div className="absolute left-3 top-3 flex gap-2">
                    <Badge>{hotel.city}, {hotel.country}</Badge>
                </div>
            </div>
            <div className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h3 className="text-base font-semibold text-neutral-900">{hotel.name}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{hotel.description}</p>
                    </div>
                </div>
                <div className="mt-1 flex items-center justify-between">
                    <StarRating value={avg} count={count} />
                    <div className="text-right">
                        {minPrice !== null ? (
                            <>
                                <div className="text-sm text-neutral-500">From</div>
                                <div className="text-lg font-semibold">€{minPrice.toFixed(0)} <span className="text-sm font-normal text-neutral-500">/ night</span></div>
                            </>
                        ) : (
                            <div className="text-sm text-neutral-500">No rooms listed</div>
                        )}
                    </div>
                </div>
                <Link href={`/HotelDetails/${hotel.id}`} className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800">
                    View details <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
};

export default HotelCard;