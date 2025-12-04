"use client";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { loginInitialState } from "@/types/user";
import { Label } from "@radix-ui/react-label";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { HiOutlineTableCells } from "react-icons/hi2";
import { RiFilePaperLine } from "react-icons/ri";
import { WiRainMix } from "react-icons/wi";
const initialState: loginInitialState = {
    success: false,
    message: "",
};

export default function LoginPage() {
    const [state, loginAction] = useActionState(login, initialState);
    const status = useFormStatus();

    const signupCards = [
        {
            icon: (
                <div className="bg-[var(--light-teal)] h-[41px] w-[41px] rounded-full flex justify-center items-center">
                    <WiRainMix className="text-[29px] text-[var(--teal)]" />
                </div>
            ),
            title: "Notifications From FEMA",
        },
        {
            icon: (
                <div className="bg-[var(--light-teal)] h-[41px] w-[41px] rounded-full flex justify-center items-center">
                    <RiFilePaperLine className="text-[20px] text-[var(--teal)]" />
                </div>
            ),
            title: "Filing disaster-related claim reports",
        },
        {
            icon: (
                <div className="bg-[var(--light-teal)] h-[41px] w-[41px] rounded-full flex justify-center items-center">
                    <HiOutlineTableCells className="text-[22px] text-[var(--teal)]" />
                </div>
            ),
            title: "Updated Expense Trackers",
        },
    ];

    useEffect(() => {
        if (state?.success) {
            redirect("/");
        }
    }, [state?.success]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone mx-8">
            <div className="flex justify-center items-center max-w-[1162px] gap-[30px]">
                <Card className="w-1/2 flex-shrink-0 self-stretch p-[52px] flex flex-col justify-center items-center gap-[40px]">
                    <Image src="/IconLogo.png" alt="Prisere Logo" width={131} height={131}/>
                    <div className="flex flex-col gap-[20px] w-full">
                        <h2 className="font-bold text-[35px] text-center">Stay Prepared with Prisere.</h2>
                        <p className="text-[16px]">
                            Experience business continuity even amidst global disasters. With partnerships from esteemed
                            institutions and a track record recognized globally, Prisere offers unrivaled expertise in
                            disaster risk reduction and resilience.
                        </p>
                    </div>
                    <div className="flex flex-col gap-[20px] w-full">
                        {signupCards.map((card, index) => (
                            <div
                                key={index}
                                className="border border-1 border-stone-200 rounded-[20px] p-[10px] flex items-center gap-[10px]"
                            >
                                {card.icon}
                                <p className="text-[16px]">{card.title}</p>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card className="w-1/2 p-[52px] flex-shrink-0 max-w-1/2 gap-[60px] self-stretch flex flex-col justify-center items-center">
                    <div className="flex justify-center">
                        <h2 className="text-[30px] text-black font-bold"> Log In </h2>
                    </div>
                    <form className="space-y-[30px] bg-white w-full">
                        <div className="w-full flex flex-col items-center">
                            <div className="w-full flex flex-col gap-[8px] mb-[16px]">
                                <Label htmlFor="email" className="text-[16px]">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="exampleemail@gmail.com"
                                    required
                                    className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                                />
                            </div>
                            <div className="w-full flex flex-col gap-[8px]">
                                <Label htmlFor="password" className="text-[16px]">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="password"
                                    required
                                    className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px]  bg-transparent text-[16px]"
                                />
                            </div>
                            {!state?.success && <p className="text-red-500 text-sm"> {state.message}</p>}
                        </div>
                        <div className="w-full flex flex-col gap-2 items-center">
                            <Button
                                formAction={loginAction}
                                variant="secondary"
                                disabled={status.pending}
                                className="max-h-[45px] w-fit bg-[var(--fuchsia)] text-white px-[20px] py-[12px] text-[16px]"
                            >
                                Log In
                            </Button>
                            <Button
                                type="button"
                                variant="link"
                                onClick={() => {
                                    redirect("/signup");
                                }}
                                disabled={status.pending}
                                className="underline text-[12px] decoration-1 hover:text-gray-400 h-fit font-bold"
                            >
                                {status.pending ? <Spinner /> : <></>}
                                New User? Sign up
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
