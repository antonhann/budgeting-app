"use client";

import { auth } from "@/lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState(auth.currentUser);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 space-y-6 text-center">
        <h1 className="text-3xl font-bold">Welcome to the Home Page</h1>

        {user ? (
          <div className="space-y-4">
            <p className="text-lg">
              Welcome, <span className="font-semibold">{user.email}</span> 👋
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              >
                Dashboard
              </Link>
              <Link
                href="/settings"
                className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition"
              >
                Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
              >
                Log Out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
