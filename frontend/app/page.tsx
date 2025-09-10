'use client'
import Image from "next/image";
import { supabase } from "@/utilities/supabaseClient";
import { createUser } from "@/app/api/auth";

async function handleRegister(e: React.FormEvent) {
  e.preventDefault();
  const { data, error } = await supabase.auth.signUp({
    email: "zainab.imadulla@icloud.com",
    password: "zainab123",
  });

  const token = (await supabase.auth.getSession()).data.session?.access_token
  console.log("token", token)
  const user = await createUser({email: "zainab.imadulla@icloud.com"})
  console.log(user)
}

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <button onClick={handleRegister}> Register </button>
    </div>
  );
}
