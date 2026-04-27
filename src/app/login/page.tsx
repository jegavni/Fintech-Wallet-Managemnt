"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await api.post("/api/login", {
        email,
        password,
      });

      router.push("/dashboard");
    } catch (error: any) {
      console.log(error.response?.data || error.message);
      alert("Login Failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-[400px] rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-3 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white p-2 rounded mb-3"
        >
          Login
        </button>

        <p className="text-center">
          Don&apos;t have an account?
          <Link href="/register" className="ml-2 text-blue-600">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}