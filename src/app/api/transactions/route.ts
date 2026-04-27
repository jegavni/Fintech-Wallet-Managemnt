import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

/*
POST -> Add transaction using logged-in user
GET  -> Fetch transactions + wallet balance using logged-in user
*/

export async function POST(req: Request) {
  try {
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

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );

    const user_id = decoded.userId;

    const body = await req.json();

    const {
      type,
      description,
      amount,
      transaction_type,
    } = body;

    if (!amount || !transaction_type) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      `
      INSERT INTO transactions
      (user_id, type, description, amount, transaction_type)
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




export async function GET() {
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
    console.log("Fetching transactions for user_id:", user_id);

    // Fetch transactions
    const [transactions]: any = await db.query(
      `
      SELECT
        id,
        user_id,
        type,
        description,
        amount,
        transaction_type,
        created_at
      FROM transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [user_id]
    );

    // Calculate wallet balance
    const [walletResult]: any = await db.query(
      `
      SELECT
        COALESCE(
          SUM(
            CASE
              WHEN transaction_type = 'credit' THEN amount
              WHEN transaction_type = 'debit' THEN -amount
              ELSE 0
            END
          ),
          0
        ) AS wallet_balance
      FROM transactions
      WHERE user_id = ?
      `,
      [user_id]
    );

    return NextResponse.json({
      success: true,
      wallet_balance: walletResult[0].wallet_balance,
      transactions,
    });
  } catch (error) {
    console.error("GET Transaction Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch transactions",
      },
      { status: 500 }
    );
  }
}