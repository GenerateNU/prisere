import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import React from "react";

type infoPageProps = {
    handleNext: () => void;
    title: string;
    description: string;
    buttonText?: string;
    image: React.ReactNode;
    optional?: boolean;
};

export default function InfoPage({
    handleNext,
    title,
    description,
    optional = false,
    buttonText = "Next",
    image,
}: infoPageProps) {
    return (
        <Card className="w-full max-w-[801px] px-[80px] py-[127px] items-center gap-[36px]">
            <div className="flex flex-col items-center">
                {optional && (
                    <div className="w-fit h-fit text-[12px] px-[8px] py-[4px] font-bold rounded-[4px] text-[var(--teal)] bg-[var(--light-teal)] mb-[12px]">
                        OPTIONAL
                    </div>
                )}
                <p className="font-bold text-[30px] mb-[14px] text-center">{title}</p>
                <p className="text-center text-[16px]">{description}</p>
            </div>
            {image}
            <div className="flex flex-col justify-center items-center">
                <Button
                    onClick={handleNext}
                    className="max-h-[45px] w-fit bg-[var(--fuchsia)] text-white px-[20px] py-[12px] text-[16px]"
                >
                    {buttonText}
                </Button>
                {optional && (
                    <Button
                        type="button"
                        variant="link"
                        onClick={handleNext}
                        className="underline hover:text-stone-200 h-fit w-fit text-[12px] font-bold p-0 mt-[12px]"
                    >
                        Skip for now
                    </Button>
                )}
            </div>
        </Card>
    );
}
