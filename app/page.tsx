"use client";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { signOut } from "firebase/auth";
import {useRouter} from "next/navigation";
export default function Home() {
  const currentUser = auth.currentUser
  const router = useRouter();

  const handleSignout = async() => { 
    try{
      await signOut(auth);
      router.push("/");
    }
    catch(error){
      console.error(error)
    }
  }
  
  return (
    <div>
        <h1>This is the Home page</h1>
        {currentUser && <p> Welcome {currentUser?.email}<button onClick={() => handleSignout()}>Log Out</button></p>}
        <Link href = "/login">Login</Link>
    </div>
  );
  
}
