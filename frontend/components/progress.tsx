import React from "react";

interface ProgressProps {
    progress: number;
    items: string[];
}
const Progress = ({ progress, items }: ProgressProps) => {
    return (
        <div className="h-[84px] flex items-center justify-center self-center justify-self-center my-[40px] w-full gap-[30px]">
            {items.map((item, index) => (
                <div
                    key={index}
                    className={`flex items-center w-full gap-[30px] ${index === items.length - 1 && "max-w-[96px]"}`}
                >
                    <div className="flex flex-col items-center gap-2 ${}">
                        <div
                            className={`rounded-[100px] w-[36px] h-[36px] ${index <= progress ? "bg-[#646464]" : "bg-[#8d8d8d99]"} text-white flex items-center justify-center`}
                        >
                            <p className="text-[20px] font-semibold">{index + 1}</p>
                        </div>
                        <p className="text-base text-center"> {item} </p>
                    </div>
                    {index !== items.length - 1 && (
                        <hr
                            className={`flex-grow ${index < progress ? " bg-[#646464]" : "bg-[#8d8d8d99]"} h-[1px] w-full border-none`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default Progress;
