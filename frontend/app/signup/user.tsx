"use client";
import { createUser } from "@/api/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    const { isPending, error, mutate } = useMutation({
        mutationFn: (payload: CreateUserRequest) => createUser(payload),
        onSuccess: () => {
            setProgress(progress + 1);
        },
    });

    return (
        <div className="max-w-lg w-full space-y-8">
            <div className="flex justify-center">
                <label className="block text-4xl text-black font-bold"> Profile Information </label>
            </div>
            <div className="w-full flex flex-col items-center space-y-4">
                <Input
                    id="name"
                    name="firstName"
                    type="name"
                    placeholder="First Name"
                    required
                    onChange={(e) => setPayload({ ...payload, firstName: e.target.value })}
                />
                <Input
                    id="name"
                    name="lastName"
                    type="name"
                    placeholder="Last Name"
                    required
                    onChange={(e) => setPayload({ ...payload, lastName: e.target.value })}
                />
            </div>
            <div className="w-full flex flex-col gap-2 items-center">
                <Button type="button" onClick={() => mutate(payload)} disabled={isPending}>
                    Next
                </Button>
                {error && <p>{error.message}</p>}
            </div>
        </div>
    );
}
