// src/app/api/lpg/route.ts

import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// GET -> Fetch LPG customer details using consumer number
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const consumerNumber = searchParams.get("consumerNumber");

    if (!consumerNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Consumer number is required",
        },
        { status: 400 }
      );
    }

    const [rows]: any = await db.query(
      "SELECT * FROM lpg_customers WHERE consumer_number = ?",
      [consumerNumber]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Consumer not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("LPG GET Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch LPG customer details",
      },
      { status: 500 }
    );
  }
}

// POST -> Book LPG cylinder / payment entry
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      consumerNumber,
      customerName,
      provider,
      amount,
      status = "Pending",
    } = body;

    if (!consumerNumber || !customerName || !provider || !amount) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      `INSERT INTO lpg_bookings 
      (consumer_number, customer_name, provider, amount, status)
      VALUES (?, ?, ?, ?, ?)`,
      [consumerNumber, customerName, provider, amount, status]
    );

    return NextResponse.json({
      success: true,
      message: "LPG booking created successfully",
      bookingId: result.insertId,
    });
  } catch (error) {
    console.error("LPG POST Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create LPG booking",
      },
      { status: 500 }
    );
  }
}