import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GoSync } from "react-icons/go";
import { FiUpload } from "react-icons/fi";

interface QuickbooksInfoProps {
    handleNext: () => void;
}

export default function Quickbooks({ handleNext }: QuickbooksInfoProps) {
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
                        className="max-h-[45px] w-fit bg-[var(--fuchsia)] text-white py-[12px] text-[16px]"
                        style={{ paddingInline: "20px" }}
                    >
                        <GoSync /> Sync Quickbooks
                    </Button>
                </div>
                <div className="w-full flex flex-col items-center">
                    <Button
                        type="button"
                        className="max-h-[45px] w-fit bg-[var(--fuchsia)] text-white py-[12px] text-[16px]"
                        style={{ paddingInline: "20px" }}
                    >
                        <FiUpload /> Upload CSV
                    </Button>
                </div>
                <div className="w-full flex flex-col items-center">
                    <Button
                        type="button"
                        variant="link"
                        onClick={() => handleNext()}
                        className="underline hover:text-stone-200 h-fit w-fit text-[12px] font-bold p-0"
                    >
                        Skip for now
                    </Button>
                </div>
            </div>
        </Card>
    );
}
