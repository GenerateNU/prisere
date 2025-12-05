"use client";

import { getCompany, updateCompany } from "@/api/company";
import { UpdateCompanyRequest } from "@/types/company";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import CompanyEditor from "./BusinessInfoEditor";
import { getUser } from "@/api/user";
import { Card } from "@/components/ui/card";
import Loading from "@/components/loading";
import { useServerActionQuery } from "@/api/requestHandlers";

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

    const { data: businessQuery, isPending: businessPending } = useServerActionQuery({
        queryKey: ["businessInfo"],
        queryFn: getCompany,
    });

    const { data: userQuery } = useServerActionQuery({
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
                <Card className="w-full px-[28px] py-[20px] border-none shadow-none">
                    <div className="flex items-center w-3/4">
                        <p className="text-[20px] font-bold">Business Information</p>
                    </div>
                    <Loading lines={2} />
                </Card>
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
