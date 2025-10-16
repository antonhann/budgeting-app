"use client";
import { auth } from "@/lib/firebase";

export default function Home() {
  console.log("Current Firebase user:", auth.currentUser);
  return <div>Firebase initialized ✅</div>;
}
