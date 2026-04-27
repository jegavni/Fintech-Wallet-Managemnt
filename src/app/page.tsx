import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">
        Welcome to PayNest
      </h1>

      <p className="mb-6 text-gray-600">
        Your Banking as a Service Platform
      </p>

      <Link
        href="/login"
        className="bg-black text-white px-6 py-3 rounded-lg"
      >
        Go to Login
      </Link>
    </div>
  );
}