"use client";
import { Button } from "@/components/ui/button";
import NavBarCircle from "@/icons/NavBarCircle";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type StartProps = {
    handleStepForward: () => void;
};

export default function StartStep({ handleStepForward }: StartProps) {
    const router = useRouter();
    return (
        <div className="h-full">
            <div className="self-start">
                <Button
                    className="flex justify-start items-center "
                    variant="link"
                    onClick={() => router.push("/claims")}
                >
                    <ArrowLeft />
                    <p>Back to Reports</p>
                </Button>
            </div>
            <div className="flex justify-center items-center h-full mt-8">
                <div className="flex flex-col items-center justify-center gap-[43px] w-[500px] h-full">
                    <h3 className="font-bold text-[40px] text-center">Build your claim report</h3>
                    <div>
                        <p className="text-[20px] text-center">
                            We know filing a disaster claim can be stressful — we&apos;re here to make it easier.
                        </p>
                        <br />
                        <p className="text-[20px] text-center">
                            {" "}
                            This information will help build your claim report, but not all of it is required.
                            Don&apos;t worry if you don&apos;t have all of the details now.
                        </p>
                    </div>
                    <ul className="flex flex-col gap-[10px]">
                        <li>
                            <div className="flex text-[15px] w-[330px] h-[65px] items-center gap-[10px] rounded-[20px] border-[1px] border-[#bfbfbf] p-[10px]">
                                <NavBarCircle size={40} />
                                Update disaster related expenses
                            </div>
                        </li>
                        <li>
                            <div className="flex text-[15px] w-[330px] h-[65px] items-center gap-[10px] rounded-[20px] border-[1px] border-[#bfbfbf] p-[10px]">
                                <NavBarCircle size={40} />
                                Insurance information
                            </div>
                        </li>
                        <li>
                            <div className="flex text-[15px] w-[330px] h-[65px] items-center gap-[10px] rounded-[20px] border-[1px] border-[#bfbfbf] p-[10px]">
                                <NavBarCircle size={40} />
                                Images of damage or property loss
                            </div>
                        </li>
                    </ul>
                    <Button className="rounded-50 w-[250px] text-[20px] h-[65px]" onClick={handleStepForward}>
                        Let&apos;s Get Started
                    </Button>
                </div>
            </div>
        </div>
    );
}
