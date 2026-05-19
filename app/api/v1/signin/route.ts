import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken"

export async function POST(req: NextRequest) {
    const JWT_SECRET=process.env.JWT_SECRET;
    await connectToDatabase();
  try {
    const body = await req.json();
    const { email, password ,longitude,latitude} = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    const user = await User.findOneAndUpdate(
      { email },
      { location: { latitude, longitude } },
      { new: true }
    
    );
    if(!user || user.isOwner){
        return NextResponse.json(
            {message:"User not found !"},
            {status:404}
        )
    }
    if(user.password===password){
      const token = jwt.sign({ email }, JWT_SECRET!, { expiresIn: '7d' });
      return NextResponse.json({ token: token, isOwner: false }, { status: 200 });

    }
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}