"use client";
import { createUser } from "@/api/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { CreateUserRequest } from "@/types/user";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Dispatch, SetStateAction } from "react";

interface UserInfoProps {
    email: string;
    progress: number;
    setProgress: Dispatch<SetStateAction<number>>;
}
export default function UserInfoPage({ email, progress, setProgress }: UserInfoProps) {
    const [payload, setPayload] = useState<CreateUserRequest>({
        firstName: "",
        lastName: "",
        email: email,
    });
    const { isPending, mutate } = useMutation({
        mutationFn: (payload: CreateUserRequest) => createUser(payload),
        onSuccess: () => {
            setProgress(progress + 1);
        },
        onError: (error: Error) => {
            setFieldError(error.message || "An error occurred while creating the user.");
        },
    });

    const [fieldError, setFieldError] = useState<string | null>(null);

    const handleSubmit = () => {
        if (!payload.firstName || !payload.lastName /*|| !payload.phone */) {
            setFieldError("Please fill in all required fields.");
            return;
        }
        setFieldError(null);
        mutate(payload);
    };

    return (
        <div className="max-w-lg w-full space-y-[30px]">
            <div className="flex justify-center">
                <label className="block text-[30px] text-black font-bold mb-[30px]"> Profile Information </label>
            </div>
            <div className="w-full flex flex-col items-center space-y-[16px]">
                <div className="flex flex-col gap-[16px] w-full">
                    <Label htmlFor="name" className="text-[20px]">
                        First Name<span className="text-red-500 text-[20px]">*</span>
                    </Label>
                    <Input
                        id="firstName"
                        name="firstName"
                        type="name"
                        required
                        className="h-[85px]"
                        onChange={(e) => setPayload({ ...payload, firstName: e.target.value })}
                    />
                </div>
                <div className="flex flex-col gap-[16px] w-full">
                    <Label htmlFor="name" className="text-[20px]">
                        Last Name<span className="text-red-500 text-[20px]">*</span>
                    </Label>
                    <Input
                        id="lastName"
                        name="lastName"
                        type="name"
                        required
                        className="h-[85px]"
                        onChange={(e) => setPayload({ ...payload, lastName: e.target.value })}
                    />
                </div>
                <div className="flex flex-col gap-[16px] w-full">
                    <Label htmlFor="phone" className="text-[20px]">
                        Phone Number<span className="text-red-500 text-[20px]">*</span>
                    </Label>
                    <Input
                        id="phone"
                        name="phone"
                        type="phone"
                        required
                        className="h-[85px]"
                        onChange={(e) => setPayload({ ...payload, lastName: e.target.value })}
                    />
                </div>
            </div>
            <div className="w-full flex flex-col gap-[20px] items-center">
                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="h-[85px] bg-[var(--teal)] text-white"
                >
                    {isPending ? <Spinner /> : <></>}
                    Next
                </Button>
                {fieldError && <p className="text-red-500 text-sm">{fieldError}</p>}
            </div>
        </div>
    );
}
