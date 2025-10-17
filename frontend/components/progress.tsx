import React from "react";

interface ProgressProps {
    progress: number;
    items: string[];
}
const Progress = ({ progress, items }: ProgressProps) => {
    return (
        <div className="flex flex-row">
            {items.map((item, index) => (
                <div key={index} className="flex flex-row items-center">
                    <div className="flex flex-col items-center gap-2 ${}">
                        <div
                            className={`h-[3vh] w-[3vh] rounded-full text-2xl flex items-center justify-center text-white ${progress === index ? "bg-stone-800" : "bg-stone-500"}`}
                        >
                            {index + 1}
                        </div>
                        <p className="text-base text-center"> {item} </p>
                    </div>

                    {index !== items.length - 1 && <hr className="border-1 border-stone-500 w-[5vw]" />}
                </div>
            ))}
        </div>
    );
};

export default Progress;
