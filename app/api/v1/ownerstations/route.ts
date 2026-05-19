import auth from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import ParkingLot from "@/models/ParkingLot";
import Booking from "@/models/Booking";
import User from "@/models/User";

export async function GET() {
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
    
    if (!user || !user.isOwner) {
        return NextResponse.json(
            { message: "not authorized" },
            { status: 403 }
        );
    }

    try {
        // Get owner's parking lot
        const parkingLot = await ParkingLot.findOne({ ownerID: user._id });
        
        if (!parkingLot) {
            return NextResponse.json(
                { message: "no parking lot found", bookingCount: 0, station: null },
                { status: 200 }
            );
        }

        // Count bookings for this parking lot
        const bookingCount = await Booking.countDocuments({ 
            parkingLotId: parkingLot._id.toString(),
            isOccupied: true 
        });

        // Get all bookings for this parking lot
        const bookings = await Booking.find({ 
            parkingLotId: parkingLot._id.toString() 
        });

        // Extract booking IDs
        const bookingIds = bookings.map(booking => booking.bookingId);
        const activeBookingIds = bookings
            .filter(booking => booking.isOccupied)
            .map(booking => booking.bookingId);

        return NextResponse.json(
            {
                message: "success",
                station: {
                    id: parkingLot._id,
                    location: parkingLot.location,
                    totalSlots: parkingLot.totalSlots,
                    availableSlots: parkingLot.totalSlots - bookingCount
                },
                bookingStats: {
                    totalBookings: bookings.length,
                    activeBookings: bookingCount,
                    inactiveBookings: bookings.length - bookingCount
                },
                bookingIds: bookingIds,
                activeBookingIds: activeBookingIds,
                allBookings: bookings.map(booking => ({
                    id: booking._id,
                    bookingId: booking.bookingId,
                    userId: booking.userId,
                    isOccupied: booking.isOccupied,
                    date: booking.date
                }))
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "error fetching booking data", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
