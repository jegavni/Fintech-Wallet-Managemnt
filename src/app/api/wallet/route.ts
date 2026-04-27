import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    accountNumber: "1234567890",
    balance: 5000,
  });
}