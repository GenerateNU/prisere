"use client";
import { login } from "@/actions/auth";
import { getCompany } from "@/api/company";
import { importQuickbooksData } from "@/api/quickbooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginInitialState } from "@/types/user";
import { redirect } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

const initialState: loginInitialState = {
    success: false,
    message: "",
};

export default function LoginPage() {
    const [state, loginAction] = useActionState(login, initialState);
    const status = useFormStatus();

    useEffect(() => {
        if (state?.success) {
            // Start import in the background, do not wait before redirect happens
            (async () => {
                const company = await getCompany();
                if (company?.externals) {
                    importQuickbooksData();
                }
            })();
            redirect("/");
        }
    }, [state?.success]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone">
            <div className="max-w-lg w-full space-y-8">
                <div className="flex justify-center">
                    <label className="block text-4xl text-black font-bold"> Log In </label>
                </div>
                <form className="mt-8 space-y-6 bg-white p-8">
                    <div className="w-full flex flex-col items-center space-y-4">
                        <Input id="email" name="email" type="email" placeholder="Email" required />
                        <Input id="password" name="password" type="password" placeholder="Password" required />
                        {state?.success && <p className="text-red-500 text-sm"> {state.message}</p>}
                    </div>

                    <div className="w-full flex flex-col gap-2 items-center">
                        <Button formAction={loginAction} variant="secondary" disabled={status.pending}>
                            LOG IN
                        </Button>
                        <Button
                            type="button"
                            variant="default"
                            onClick={() => redirect("/signup")}
                            disabled={status.pending}
                        >
                            Sign Up
                        </Button>
                        <p> Forgot Password?</p>
                    </div>
                </form>
            </div>
        </div>
    );
}
