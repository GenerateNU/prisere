import { setCompanyMetadata } from "@/actions/auth";
import { createCompany } from "@/api/company";
import { createLocation } from "@/api/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Company, CreateCompanyRequest } from "@/types/company";
import { CreateLocationRequest } from "@/types/location";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Dispatch, SetStateAction } from "react";

interface CompanyInfoProps {
    progress: number;
    setProgress: Dispatch<SetStateAction<number>>;
}

export default function Company({ progress, setProgress }: CompanyInfoProps) {
    const router = useRouter();
    const [companyPayload, setCompanyPayload] = useState<CreateCompanyRequest>({
        name: "",
    });
    const [locationPayload, setLocationPayload] = useState<CreateLocationRequest>({
        country: "United States",
        stateProvince: "",
        city: "",
        streetAddress: "",
        postalCode: "",
        county: "Roxbury",
    });

    const {
        isPending: isLocationPending,
        error: locationError,
        mutate: mutateLocation,
    } = useMutation({
        mutationFn: (payload: CreateLocationRequest) => createLocation(payload),
        onSuccess: () => {
            setProgress(progress);
            router.push("/");
        },
    });

    const { isPending, error, mutate } = useMutation<Company, Error, CreateCompanyRequest>({
        mutationFn: (payload: CreateCompanyRequest) => createCompany(payload),
        onSuccess: async (data: Company) => {
            await setCompanyMetadata(data.id);
            mutateLocation(locationPayload);
        },
    });

    return (
        <div className="max-w-lg w-full space-y-8">
            <div className="flex justify-center">
                <label className="block text-4xl text-black font-bold"> Business Information </label>
            </div>
            <div className="w-full flex flex-col items-center space-y-4">
                <div className="flex flex-col items-center gap-4 w-full">
                    <label className="whitespace-nowrap self-start">
                        Business Name<span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Business Name"
                        required
                        onChange={(e) => setCompanyPayload({ ...companyPayload, name: e.target.value })}
                    />
                </div>
                <div className="flex flex-col items-center gap-4 w-full">
                    <label className="whitespace-nowrap self-start">
                        Address Line 1<span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                        id="name"
                        name="streetAddress"
                        type="name"
                        required
                        onChange={(e) => setLocationPayload({ ...locationPayload, streetAddress: e.target.value })}
                    />
                </div>
                <div className="flex flex-col items-center gap-4 w-full">
                    <label className="whitespace-nowrap self-start">
                        City <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                        id="name"
                        name="city"
                        type="name"
                        required
                        onChange={(e) => setLocationPayload({ ...locationPayload, city: e.target.value })}
                    />
                </div>

                <div className="flex flex-col items-center gap-4 w-full">
                    <label className="whitespace-nowrap self-start">
                        State <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                        id="name"
                        name="stateProvince"
                        type="name"
                        required
                        onChange={(e) => setLocationPayload({ ...locationPayload, stateProvince: e.target.value })}
                    />
                </div>

                <div className="flex flex-col items-center gap-4 w-full">
                    <label className="whitespace-nowrap self-start">
                        Zip Code <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                        id="name"
                        name="postalCode"
                        type="name"
                        required
                        onChange={(e) => setLocationPayload({ ...locationPayload, postalCode: e.target.value })}
                    />
                </div>
            </div>
            <div className="w-full flex flex-col gap-2 items-center">
                <Button type="button" onClick={() => mutate(companyPayload)} disabled={isPending || isLocationPending}>
                    Next
                </Button>
                {(error || locationError) && <p> {error?.message || locationError?.message} </p>}
            </div>
        </div>
    );
}
