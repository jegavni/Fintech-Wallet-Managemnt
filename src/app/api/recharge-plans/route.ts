
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/lib/db";


export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT * FROM recharge_plans ORDER BY amount ASC"
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}



/*
POST -> Save recharge transaction using logged-in user */


export async function POST(req: Request) {
  try {
    // Get token from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "No token found",
        },
        { status: 401 }
      );
    }

    // Decode JWT
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );

    const user_id = decoded.userId;

    // Get frontend body
    const body = await req.json();

    const {
      type,
      description,
      amount,
      transaction_type,
    } = body;

    // Validation
    if (!amount || !transaction_type) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Insert transaction
    const [result]: any = await db.query(
      `
      INSERT INTO transactions
      (
        user_id,
        type,
        description,
        amount,
        transaction_type
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        user_id,
        type,
        description,
        amount,
        transaction_type,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Transaction added successfully",
      result,
    });
  } catch (error) {
    console.error("POST Transaction Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add transaction",
      },
      { status: 500 }
    );
  }
}

