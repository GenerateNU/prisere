"use client";
import { createUser } from "@/api/user";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { CreateUserRequest } from "@/types/user";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

interface UserInfoProps {
    email: string;
    handleNext: () => void;
}
export default function UserInfoPage({ email, handleNext }: UserInfoProps) {
    const [payload, setPayload] = useState<CreateUserRequest>({
        firstName: "",
        lastName: "",
        email: email,
        phoneNumber: "",
    });
    const { isPending, mutate } = useMutation({
        mutationFn: (payload: CreateUserRequest) => createUser(payload),
        onSuccess: () => {
            handleNext();
        },
        onError: (error: Error) => {
            setFieldError(error.message || "An error occurred while creating the user.");
        },
    });

    const [fieldError, setFieldError] = useState<string | null>(null);

    const handleSubmit = () => {
        if (!payload.firstName || !payload.lastName || !payload.phoneNumber) {
            setFieldError("Please fill in all required fields.");
            return;
        }
        setFieldError(null);
        mutate(payload);
    };

    return (
        <Card className="flex flex-col h-[706px] justify-center items-center w-full space-y-[30px] px-[163px] py-[127px]">
            <div className="flex justify-center">
                <label className="block text-[30px] text-black font-bold"> Profile Information </label>
            </div>
            <div className="w-full flex flex-col items-center">
                <div className="flex flex-col gap-[8px] w-full mb-[16px]">
                    <Label htmlFor="name" className="text-[16px]">
                        First Name<span className="text-red-500 text-[20px]">*</span>
                    </Label>
                    <Input
                        id="firstName"
                        name="firstName"
                        type="name"
                        required
                        className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                        onChange={(e) => setPayload({ ...payload, firstName: e.target.value })}
                    />
                </div>
                <div className="flex flex-col gap-[8px] w-full mb-[16px]">
                    <Label htmlFor="name" className="text-[16px]">
                        Last Name<span className="text-red-500 text-[20px]">*</span>
                    </Label>
                    <Input
                        id="lastName"
                        name="lastName"
                        type="name"
                        required
                        className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                        onChange={(e) => setPayload({ ...payload, lastName: e.target.value })}
                    />
                </div>
                <div className="flex flex-col gap-[8px] w-full">
                    <Label htmlFor="phone" className="text-[16px]">
                        Phone Number<span className="text-red-500 text-[20px]">*</span>
                    </Label>
                    <Input
                        id="phone"
                        name="phone"
                        type="phone"
                        required
                        className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                        onChange={(e) => setPayload({ ...payload, phoneNumber: e.target.value })}
                    />
                </div>
            </div>
            <div className="w-full flex flex-col gap-[20px] items-center">
                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="max-h-[45px] w-fit bg-[var(--fuchsia)] text-white hover:bg-pink hover:text-fuchsia px-[20px] py-[12px] text-[16px]"
                >
                    {isPending ? <Spinner /> : <></>}
                    Next
                </Button>
                {fieldError && <p className="text-red-500 text-sm">{fieldError}</p>}
            </div>
        </Card>
    );
}
