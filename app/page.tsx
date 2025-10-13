"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/firebase";

export default function Home() {
  useEffect(() => {
    if (analytics) {
      console.log("Firebase Analytics initialized");
    }
  }, []);

  return <div>Check your browser console</div>;
}
