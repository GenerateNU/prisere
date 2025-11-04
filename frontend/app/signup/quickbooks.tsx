import { Button } from "@/components/ui/button";
import UploadIcon from "@/icons/UploadIcon";
import { Dispatch, SetStateAction } from "react";

interface QuickbooksInfoProps {
    progress: number;
    setProgress: Dispatch<SetStateAction<number>>;
}

export default function Quickbooks({ progress, setProgress }: QuickbooksInfoProps) {
    return (
        <div className="w-[430px] space-y-[30px]">
            <div className="flex justify-center">
                <label className="block text-[30px] text-black font-bold mt-[30px] mb-[10px]">
                    Let&apos;s connect your data
                </label>
            </div>
            <div className="flex justify-center px-2">
                <p className="text-center">
                    Connect your Quickbooks account or manually upload a CSV to see hwo well your business is doing.
                </p>
            </div>
            <div className="flex flex-col gap-[20px]">
                <div className="w-full flex flex-col items-center">
                    <Button type="button" className="h-[85px] bg-[var(--teal)] text-white">
                        Sign in with Quickbooks
                    </Button>
                </div>
                <div className="w-full flex flex-col items-center">
                    <Button type="button" className="h-[85px] bg-[var(--teal)] text-white">
                        <UploadIcon /> Upload a CSV
                    </Button>
                </div>
                <div className="w-full flex flex-col items-center">
                    <Button
                        type="button"
                        variant="link"
                        onClick={() => setProgress(progress + 1)}
                        className="underline hover:text-stone-200 h-fit font-[16px]"
                    >
                        I&apos;ll add later
                    </Button>
                </div>
            </div>
        </div>
    );
}
