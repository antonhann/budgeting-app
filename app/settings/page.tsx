"use client";

import Link from "next/link";

export default function Settings() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 space-y-4 text-center">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p>Manage your account settings here.</p>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
