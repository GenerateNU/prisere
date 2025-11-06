"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { IoMdArrowBack } from "react-icons/io";
import Notification from "./notification";

export default function Page() {
    const router = useRouter();
    return (
        <div className="p-15 bg-slate w-full h-screen">
            <div className="flex row gap-5 pb-15">
                <Button size="icon" onClick={() => router.push("/")}>
                    <IoMdArrowBack />
                </Button>
                <h1 className="text-charcoal text-3xl font-bold"> Notifications </h1>
            </div>

            <div className="flex flex-col">
                <Notification/>

            </div>
        </div>
    );
}
