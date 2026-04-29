// app/api/electricity/fetch-bill/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { consumerNumber } = await req.json();

    // Replace this mock with actual electricity board API call
    const bill = {
      consumerNumber,
      customerName: "John Doe",
      boardName: "KSEB",
      amount: 1250,
      dueDate: "2026-05-10",
    };

    return NextResponse.json({
      success: true,
      bill,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch bill",
      },
      { status: 500 }
    );
  }
}
