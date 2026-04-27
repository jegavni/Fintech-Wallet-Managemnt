import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

export async function GET() {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // If no token → user not logged in
    if (!token) {
      return NextResponse.json(
        {
          authenticated: false,
          message: "User not logged in",
        },
        { status: 401 }
      );
    }

    // Check JWT secret
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        {
          message: "JWT_SECRET is missing",
        },
        { status: 500 }
      );
    }

    // Verify token
    const decoded: any = jwt.verify(token, secret);

    // Get user from DB
    const [rows]: any = await db.query(
      "SELECT id, name, email FROM users WHERE id = ?",
      [decoded.userId]
    );

    // If user not found
    if (rows.length === 0) {
      return NextResponse.json(
        {
          authenticated: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Success
    return NextResponse.json({
      authenticated: true,
      user: rows[0],
    });
  } catch (error) {
    console.log("AUTH CHECK ERROR:", error);

    return NextResponse.json(
      {
        authenticated: false,
        message: "Invalid or expired token",
      },
      { status: 401 }
    );
  }
}


