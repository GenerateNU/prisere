import { cn } from "@/lib/utils";
import { IoCheckmark } from "react-icons/io5";

type Step = {
    label?: string;
    step: number;
};

interface ProgressProps {
    progress: number;
    items: Step[];
    className?: string;
}
const Progress = ({ progress, items, className }: ProgressProps) => {
    return (
        <div
            className={cn(
                "h-[84px] flex items-center justify-center self-center justify-self-center mb-[40px] w-full gap-[30px]",
                className
            )}
        >
            {items.map((item, index) => (
                <div key={index} className="flex flex-row items-center justify-center gap-[30px]">
                    <div className={`flex flex-col items-center gap-2 w-fit `}>
                        <div
                            className={`h-[36px] w-[36px] rounded-full text-[20px] flex items-center justify-center text-white 
                                ${progress > item.step ? "bg-[var(--fuchsia)]" : "bg-[var(--pink)]"}
                                ${progress < item.step ? "border-1 border-[var(--fuchsia)] bg-transparent" : ""}`}
                        >
                            {progress > item.step ? (
                                <IoCheckmark className="text-[24px]" />
                            ) : (
                                <p className="text-[20px] text-[var(--fuchsia)]">{index + 1}</p>
                            )}
                        </div>
                        {item.label ? (
                            <p
                                className={`text-[16px] ${progress === item.step && "font-bold"} text-center whitespace-nowrap`}
                            >
                                {" "}
                                {item.label}{" "}
                            </p>
                        ) : null}
                    </div>
                    {index !== items.length - 1 && (
                        <hr
                            className={cn(
                                `flex-grow bg-[var(--fuchsia)] h-[3px] min-w-[70px] rounded-full w-full border-none opacity-50`,
                                item.label && "mb-[30px]",
                                item.step < progress && "opacity-100"
                            )}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default Progress;
