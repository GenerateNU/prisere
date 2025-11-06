import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dispatch, SetStateAction } from "react";

interface QuickbooksInfoProps {
    progress: number;
    setProgress: Dispatch<SetStateAction<number>>;
}

export default function Quickbooks({ progress, setProgress }: QuickbooksInfoProps) {
    return (
        <Card className="w-full px-[163px] py-[127px]">
            <div className="flex justify-center">
                <label className="block text-[30px] text-black font-bold mt-[30px] mb-[10px]">
                    Let&apos;s connect your data
                </label>
            </div>
            <div className="flex justify-center px-2">
                <p className="text-center">
                    Connect your Quickbooks account or manually upload a CSV <br /> to see how well your business is
                    doing.
                </p>
            </div>
            <div className="flex flex-col gap-[30px]">
                <div className="w-full flex flex-col items-center">
                    <Button
                        type="button"
                        className="max-h-[45px] w-fit bg-[var(--fuchsia)] text-white px-[20px] py-[12px] text-[16px]"
                    >
                        Sign in with Quickbooks
                    </Button>
                </div>
                <div className="w-full flex flex-col items-center">
                    <Button
                        type="button"
                        className="max-h-[45px] w-fit bg-[var(--fuchsia)] text-white px-[20px] py-[12px] text-[16px]"
                    >
                        Upload a CSV File
                    </Button>
                </div>
                <div className="w-full flex flex-col items-center">
                    <Button
                        type="button"
                        variant="link"
                        onClick={() => setProgress(progress + 1)}
                        className="underline hover:text-stone-200 h-fit w-fit text-[12px] font-bold p-0"
                    >
                        Skip for now
                    </Button>
                </div>
            </div>
        </Card>
    );
}
