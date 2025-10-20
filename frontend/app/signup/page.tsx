"use client";
import { signup } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { signupInitialState } from "@/types/user";
import Onboarding from "./onboarding";

const initialState: signupInitialState = {
    success: false,
    message: "",
    email: "",
};

export default function SignUpPage() {
    console.log('From Page - PROD URL:', process.env.NEXT_PUBLIC_PROD_API_BASE_URL);
    console.log('From Page - other PROD URL:', process.env.PROD_API_BASE_URL);
    console.log('From Page - NODE_ENV:', process.env.NODE_ENV);
    const [state, signupAction] = useActionState(signup, initialState);
    const status = useFormStatus();
    const [profileStage, setProfileStage] = useState<boolean>(false);

    useEffect(() => {
        if (state.success) {
            setProfileStage(true);
        }
    }, [state]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone">
            {profileStage ? (
                <Onboarding email={state.email!} />
            ) : (
                <div className="max-w-lg w-full space-y-8">
                    <div className="flex justify-center">
                        <label className="block text-4xl text-black font-bold"> Sign Up </label>
                    </div>
                    <form className="mt-8 space-y-6 bg-white p-8">
                        <div className="w-full flex flex-col items-center space-y-4">
                            <Input id="email" name="email" type="email" placeholder="Email" required />
                            <Input id="password" name="password" type="password" placeholder="Password" required />
                            {!state?.success && <p className="text-red-500 text-sm"> {state.message}</p>}
                        </div>

                        <div className="w-full flex flex-col gap-2 items-center">
                            <Button formAction={signupAction} variant="secondary" disabled={status.pending}>
                                SIGN UP
                            </Button>
                            <Button
                                type="button"
                                variant="default"
                                onClick={() => {
                                    redirect("/login");
                                }}
                                disabled={status.pending}
                            >
                                Log In
                            </Button>
                            <p> Forgot Password?</p>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
