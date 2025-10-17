"use client";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function Home() {
  const currentUser = auth.currentUser
  return (
    <div>
        <h1>This is the Home page</h1>
        {currentUser && <p> Welcome {currentUser?.email}</p>}
        <Link href = "/login">Login</Link>
    </div>
  );
  
}
