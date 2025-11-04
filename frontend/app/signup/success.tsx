import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Success() {
    const router = useRouter();
    return (
        <div className="w-full flex flex-col justify-center items-center">
            <div className="border-1 border-stone-500 mb-[50px] h-[400px] w-[390px]"></div>
            <div className="flex flex-col gap-[20px]">
                <p className="font-bold text-[40px] text-center">You&apos;re All Set!</p>
                <p className="text-center text-[20px]">You can now start using Prisere</p>
            </div>
            <Button onClick={() => router.push("/")} className="h-[85px] bg-[var(--teal)] text-white mt-[25px]">
                Go to Dashboard
            </Button>
        </div>
    );
}
