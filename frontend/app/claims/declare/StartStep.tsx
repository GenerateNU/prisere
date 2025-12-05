"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AiOutlinePicture } from "react-icons/ai";
import { LuTable } from "react-icons/lu";
import { PiIdentificationCard } from "react-icons/pi";

type StartProps = {
    handleStepForward: () => void;
};

function Icon({ children }: { children: React.ReactNode }) {
    return <div className="p-2.5 rounded-full bg-light-teal text-teal">{children}</div>;
}

export default function StartStep({ handleStepForward }: StartProps) {
    return (
        <div className="flex justify-center items-center h-full mt-8">
            <div className="flex flex-col items-center justify-center gap-9 w-[500px] h-full">
                <h3 className="font-bold text-[40px] text-center">Build your claim report</h3>
                <div>
                    <p className="text-[20px] text-center">
                        We know filing a disaster claim can be stressful — we&apos;re here to make it easier.
                    </p>
                    <br />
                    <p className="text-[20px] text-center">
                        {" "}
                        This information will help build your claim report, but not all of it is required. Don&apos;t
                        worry if you don&apos;t have all of the details now.
                    </p>
                </div>
                <ul className="flex flex-col gap-[10px]">
                    <li>
                        <div className="flex text-[15px] w-[330px] h-[65px] items-center gap-[10px] rounded-[20px] border-[1px] border-[#bfbfbf] p-[10px]">
                            <Icon>
                                <LuTable size={16} />
                            </Icon>
                            Update disaster related expenses
                        </div>
                    </li>
                    <li>
                        <div className="flex text-[15px] w-[330px] h-[65px] items-center gap-[10px] rounded-[20px] border-[1px] border-[#bfbfbf] p-[10px]">
                            <Icon>
                                <PiIdentificationCard size={16} />
                            </Icon>
                            Insurance information
                        </div>
                    </li>
                    <li>
                        <div className="flex text-[15px] w-[330px] h-[65px] items-center gap-[10px] rounded-[20px] border-[1px] border-[#bfbfbf] p-[10px]">
                            <Icon>
                                <AiOutlinePicture />
                            </Icon>
                            Images of damage or property loss
                        </div>
                    </li>
                </ul>
                <div className="flex flex-col gap-3 items-center">
                    <Button
                        size={"sm"}
                        className="bg-fuchsia text-white hover:bg-pink hover:text-fuchsia w-[135px] h-[35px] text-sm"
                        onClick={handleStepForward}
                    >
                        {"Let's Get Started"}
                    </Button>
                    <Link href="/claims">
                        <span className="text-xs underline font-bold">Back to Reports</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
