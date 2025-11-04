"use client";
import { signup } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redirect, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { signupInitialState } from "@/types/user";
import Onboarding from "./onboarding";
import { Label } from "@/components/ui/label";

const initialState: signupInitialState = {
    success: false,
    message: "",
    email: "",
};

export default function SignUpPage() {
    const searchParams = useSearchParams();
    const stage = searchParams.get("stage");
    const [state, signupAction] = useActionState(signup, initialState);
    const status = useFormStatus();
    const [profileStage, setProfileStage] = useState<boolean>(stage ? true : false);

    useEffect(() => {
        if (state.success) {
            setProfileStage(true);
        }
    }, [state]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone mx-8">
            {profileStage ? (
                <Onboarding email={state.email!} />
            ) : (
                <div className="flex w-full justify-center items-center max-w-[70%] max-h-[500px]">
                    <div className="w-1/2 flex-shrink-0 self-stretch pr-[125px] flex flex-col justify-center">
                        <img className="" src="PrisereLogo.png" alt="Prisere" />
                        <h2 className="font-bold text-[40px] mt-[40px] mb-[20px]">Stay prepared with Prisere.</h2>
                        <p className="text-[18px]">
                            Experience business continuity even amidst global disasters. With partnerships from esteemed
                            institutions and a track record recognized globally, Prisere offers unrivaled expertise in
                            disaster risk reduction and resilience.
                        </p>
                    </div>
                    <div className="w-1/2 flex-shrink-0 max-w-1/2 space-y-8 border-l border-gray-300 self-stretch pl-[125px] flex flex-col justify-center items-center">
                        <div className="flex justify-center">
                            <h2 className="text-[30px] text-black font-bold"> Get Started with Prisere </h2>
                        </div>
                        <form className="space-y-[30px] bg-white w-full">
                            <div className="w-full flex flex-col items-center">
                                <div className="w-full flex flex-col gap-[16px] mb-[16px]">
                                    <Label htmlFor="email" className="text-[20px]">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="exampleemail@gmail.com"
                                        required
                                        className="px-[25px] h-[85px] placeholder:text-gray-400"
                                    />
                                </div>
                                <div className="w-full flex flex-col gap-[16px]">
                                    <Label htmlFor="password" className="text-[20px]">
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="password"
                                        required
                                        className="px-[25px] h-[85px] placeholder:text-gray-400"
                                    />
                                </div>
                                {!state?.success && <p className="text-red-500 text-sm"> {state.message}</p>}
                            </div>
                            <div className="w-full flex flex-col gap-[30px] items-center">
                                <Button
                                    formAction={signupAction}
                                    variant="secondary"
                                    disabled={status.pending}
                                    className="max-h-[45px] w-[126px]"
                                >
                                    Sign Up
                                </Button>
                                <Button
                                    type="button"
                                    variant="link"
                                    onClick={() => {
                                        redirect("/login");
                                    }}
                                    disabled={status.pending}
                                    className="underline text-[20px] decoration-1 hover:text-gray-400 h-fit"
                                >
                                    Already have an account? Log In
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
