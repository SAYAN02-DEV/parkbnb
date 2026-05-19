import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import auth from "@/lib/auth";
import { headers } from "next/headers";
import User from "@/models/User";
import Booking from "@/models/Booking";
import ParkingLot from "@/models/ParkingLot";

export async function POST(req: NextRequest) {
    await connectToDatabase();

    const headersList = await headers();
    const token = headersList.get('token');
    const decodedData = await auth(token);

    if (!decodedData) {
        return NextResponse.json(
            { message: "not signed in" },
            { status: 404 }
        );
    }

    const email = decodedData.email;
    const user = await User.findOne({ email });
    if (!user || user.isOwner) {
        return NextResponse.json(
            { message: "not authorized" },
            { status: 403 }
        );
    }

    try {
        const body = await req.json();
        const bookingId = body.bookingId;

        if (!bookingId) {
            return NextResponse.json(
                { message: "bookingId is required" },
                { status: 400 }
            );
        }

        const booking = await Booking.findById(bookingId);
        if (!booking || booking.userId !== email) {
            return NextResponse.json(
                { message: "booking not found" },
                { status: 404 }
            );
        }

        const parkingLot = await ParkingLot.findById(booking.parkingLotId);
        if (!parkingLot) {
            return NextResponse.json(
                { message: "parking lot not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                message: "booking details",
                parkingLot: {
                    id: parkingLot._id,
                    latitude: parkingLot.location?.latitude,
                    longitude: parkingLot.location?.longitude
                }
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "failed to fetch booking details" },
            { status: 500 }
        );
    }
}
