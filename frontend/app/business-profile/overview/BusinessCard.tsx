"use client";

import { getCompany, updateCompany } from "@/api/company";
import { UpdateCompanyRequest } from "@/types/company";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import CompanyEditor from "./BusinessInfoEditor";
import { getUser } from "@/api/user";

export default function BusinessCard() {
    const [businessInfo, setBusinessInfo] = useState<UpdateCompanyRequest>({
        id: "",
        name: "",
        businessOwnerFullName: "",
    });

    const [user, setUser] = useState({
        phoneNumber: "",
        email: "",
    })

    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<boolean>(false);

    const { mutate: updateBusinessMutate } = useMutation({
        mutationFn: (businessInfo: UpdateCompanyRequest) => updateCompany(businessInfo),
        onError: (error: Error) => {
            setError(error.message);
        }
    });

    const handleSave = () => {
        updateBusinessMutate(businessInfo);
    }

    const { data: businessQuery } = useQuery({
        queryKey: ['businessInfo'],
        queryFn: getCompany
    });

    const { data: userQuery } = useQuery({
        queryKey: ['userInfo'],
        queryFn: getUser
    })

    useEffect(() => {
        if (userQuery) {
            setUser({ ...user, email: userQuery.email ?? "", phoneNumber: "" });
        }
    }, [userQuery])

    useEffect(() => {
        if (businessQuery) {
            setBusinessInfo(businessQuery);
        }
    }, [businessQuery])

    return (
        <div>
            <div className="flex gap-[38px]">
                <CompanyEditor
                    company={businessInfo}
                    user={user}
                    setCompany={(company: UpdateCompanyRequest) => setBusinessInfo(company)}
                    setUser={(userInfo) => setUser(userInfo)}
                    isExpanded={editing}
                    onExpand={() => editing ? setEditing(false) : setEditing(true)}
                    onCollapse={() => handleSave()}
                    saveError={error}
                />
            </div>
        </div>
    );
}