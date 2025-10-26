'use client';

export default function ProgressBar({ step }: { step: number }) {
    const steps = [
        {
            step: 1,
            label: "Disaster Info",
        },
        {
            step: 2,
            label: "Personal Info",
        },
        {
            step: 3,
            label: "Business Info",
        },
        {
            step: 4,
            label: "Insurer Info",
        },
        {
            step: 5,
            label: "Export Report",
        }
    ];
    return (
        <div className="h-[84px] flex items-center justify-center my-[40px] w-full gap-[30px]">
            {steps.map((s) => (
                <div key={s.step} className={`flex items-center w-full gap-[30px] ${s.step === 5 && "max-w-[96px]"}`}>
                    <div className="flex flex-col items-center gap-[10px] min-w-[96px]">
                        <div className={`rounded-[100px] w-[36px] h-[36px] ${s.step <= (step - 1) ? "bg-[#646464]" : "bg-[#8d8d8d99]"} text-white flex items-center justify-center`}>
                            <p className="text-[20px] font-semibold">{s.step}</p>
                        </div>
                        <p>{s.label}</p>
                    </div >
                    {s.step !== 5 &&
                        <hr className={`flex-grow ${s.step < (step - 1) ? " bg-[#646464]" : "bg-[#8d8d8d99]"} h-[1px] w-full border-none`} />
                    }
                </div>
            ))}
        </div>
    );
}