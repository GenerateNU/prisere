'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Claims() {
    const router = useRouter(); 
    return (
        <div className="flex flex-col gap-[32px] px-[70px] pt-[72px] mb-4 justify-center">
            <div>
                <h2 className="text-[40px] font-bold">Claim Reports</h2>
            </div>
            <Button className="mt-4 w-[200px] h-[38px]" onClick={() => router.push('/claims/declare')}>Declare a Disaster</Button>
        </div>
    );
}