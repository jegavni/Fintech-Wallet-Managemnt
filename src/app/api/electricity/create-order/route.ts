

// app/api/electricity/create-order/route.ts
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!,
});
console.log("Razorpay instance created with key:", process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);  
console.log("Razorpay instance created with secret:", process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET);

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Order creation failed",
      },
      { status: 500 }
    );
  }
}