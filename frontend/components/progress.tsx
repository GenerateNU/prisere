import Checkmark from "@/icons/Checkmark";
import React from "react";

type Step = {
    label: string;
    step: number;
};

interface ProgressProps {
    progress: number;
    items: Step[];
}
const Progress = ({ progress, items }: ProgressProps) => {
    return (
        <div className="h-[84px] flex items-center justify-center self-center justify-self-center mb-[40px] w-full gap-[30px]">
            {items.map((item, index) => (
                <div key={index} className="flex flex-row items-center justify-center gap-[30px]">
                    <div className={`flex flex-col items-center gap-2 w-fit `}>
                        <div
                            className={`h-[36px] w-[36px] rounded-full text-[20px] flex items-center justify-center text-white 
                                ${progress > item.step ? "bg-[var(--fuchsia)]" : "bg-[var(--pink)]"}
                                ${progress < item.step ? "border-1 border-[var(--fuchsia)] bg-transparent" : ""}`}
                        >
                            {progress > item.step ? (
                                <Checkmark />
                            ) : (
                                <p className="text-[20px] text-[var(--fuchsia)]">{index + 1}</p>
                            )}
                        </div>
                        <p
                            className={`text-[16px] ${progress === item.step && "font-bold"} text-center whitespace-nowrap`}
                        >
                            {" "}
                            {item.label}{" "}
                        </p>
                    </div>
                    {index !== items.length - 1 && (
                        <hr
                            className={`flex-grow bg-[var(--fuchsia)] mb-[30px] h-[3px] min-w-[70px] rounded-full ${item.step >= progress ? "opacity-50" : ""} h-[1px] w-full border-none`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default Progress;
