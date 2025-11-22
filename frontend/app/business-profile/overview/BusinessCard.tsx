"use client";

import { getCompany, updateCompany } from "@/api/company";
import { UpdateCompanyRequest } from "@/types/company";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import CompanyEditor from "./BusinessInfoEditor";
import { getUser } from "@/api/user";
import { Card } from "@/components/ui/card";

export default function BusinessCard() {
    const [businessInfo, setBusinessInfo] = useState<UpdateCompanyRequest>({
        name: "",
        businessOwnerFullName: "",
        companyType: "LLC",
        alternateEmail: "",
    });

    const [user, setUser] = useState({
        phoneNumber: "",
        email: "",
    });

    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<boolean>(false);

    const { mutate: updateBusinessMutate } = useMutation({
        mutationFn: (businessInfo: UpdateCompanyRequest) => updateCompany(businessInfo),
        onError: (error: Error) => {
            setError(error.message);
        },
    });

    const handleSave = () => {
        updateBusinessMutate(businessInfo);
        if (!error) {
            setEditing(false);
        }
    };

    const { data: businessQuery, isPending: businessPending } = useQuery({
        queryKey: ["businessInfo"],
        queryFn: getCompany,
    });

    const { data: userQuery } = useQuery({
        queryKey: ["userInfo"],
        queryFn: getUser,
    });

    useEffect(() => {
        if (userQuery) {
            setUser({ ...user, email: userQuery.email ?? "", phoneNumber: userQuery.phoneNumber });
        }
    }, [userQuery]);

    useEffect(() => {
        if (businessQuery) {
            setBusinessInfo(businessQuery);
        }
    }, [businessQuery]);

    return (
        <div>
            {businessPending ? (
                <LoadingBusinessProfile />
            ) : (
                <div className="flex gap-[38px]">
                    <CompanyEditor
                        company={businessInfo}
                        user={user}
                        setCompany={(company: UpdateCompanyRequest) => setBusinessInfo(company)}
                        setUser={(userInfo) => setUser(userInfo)}
                        isExpanded={editing}
                        onExpand={() => (editing ? setEditing(false) : setEditing(true))}
                        onCollapse={() => handleSave()}
                        saveError={error}
                        initialPending={businessPending}
                    />
                </div>
            )}
        </div>
    );
}

export function LoadingBusinessProfile() {
    return (
        <Card className="w-full px-[28px] py-[20px]">
            <div className="flex items-center w-3/4">
                <p className="text-[20px] font-bold">Business Information</p>
            </div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            </div>
        </Card>
    );
}
