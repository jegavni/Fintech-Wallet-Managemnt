import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../../../lib/db";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    console.log("Received login request for email:", email);

    // Step 1: Find user by email
    const [rows]: any = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    // Step 2: Check if user exists
    if (rows.length === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const user = rows[0];

    // Step 3: Verify password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { message: "Wrong password" },
        { status: 401 }
      );
    }

    // Step 4: Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1h",
      }
    );

    // Step 5: Set token in cookie
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });          

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 2 * 60 * 60, // 1 hour
    }); 
    

    return response;
  } catch (error) {
    console.log("Login Error:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}