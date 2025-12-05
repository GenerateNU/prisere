import { CompanyTypesEnum, UpdateCompanyRequest, businessTypes } from "@/types/company";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import React from "react";
import { Card } from "@/components/ui/card";
import { IoCheckmark } from "react-icons/io5";
import { FiEdit } from "react-icons/fi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

interface CompanyEditorProps {
    company: UpdateCompanyRequest;
    user: { phoneNumber: string; email: string };
    setCompany: (company: UpdateCompanyRequest) => void;
    setUser: (user: { phoneNumber: string; email: string }) => void;
    isExpanded?: boolean;
    onExpand: () => void;
    onCollapse: () => void;
    saveError: string | null;
    initialPending?: boolean;
}

export default function CompanyEditor({
    company,
    user,
    setCompany,
    setUser,
    isExpanded,
    onExpand,
    onCollapse,
    saveError = null,
    initialPending = false,
}: CompanyEditorProps) {
    const [error, setError] = React.useState<string | null>(null);
    const handleCollapse = () => {
        if (!company.name || !company.businessOwnerFullName || !user.phoneNumber || !user.email) {
            setError("Please fill in all required fields before saving.");
            return;
        }
        setError(null);
        onCollapse();
    };

    return (
        <Card className="w-full px-[28px] py-[20px] border-none shadow-none">
            <div className="flex items-center justify-between">
                <div className="flex gap-[10px] items-center w-3/4">
                    <p className="text-[20px] font-bold">Business Information</p>
                </div>
                <div className="flex gap-[8px] self-start">
                    <Button
                        onClick={onExpand}
                        style={{ paddingInline: 0 }}
                        className={`group p-0 flex items-center justify-center h-[35px] w-[35px] ${isExpanded ? "bg-fuchsia" : "bg-slate"} ${isExpanded ? "hover:bg-pink hover:text-fuchsia" : "hover:bg-fuchsia hover:text-white"}`}
                    >
                        <FiEdit
                            className={`${isExpanded ? "text-white" : "text-black"} ${isExpanded ? "group-hover:text-fuchsia" : "group-hover:text-white"} text-[20px]`}
                        />
                    </Button>
                </div>
            </div>
            {isExpanded ? (
                <div className="flex flex-col gap-[16px]">
                    <div className="grid grid-cols-2 gap-[16px]">
                        <div className="flex flex-col gap-[8px] w-full">
                            <Label htmlFor="businessOwnerFullName" className="text-[16px]">
                                Business Name<span className="text-red-500 text-[16px]">*</span>
                            </Label>
                            <Input
                                id="businessOwnerFullName"
                                name="businessOwnerFullName"
                                type="text"
                                required
                                className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                                value={company.name ?? ""}
                                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-[8px] w-full">
                            <Label htmlFor="companyType" className="text-[16px]">
                                Business Type<span className="text-red-500 text-[16px]">*</span>
                            </Label>
                            <Select
                                defaultValue={company.companyType}
                                onValueChange={(value: CompanyTypesEnum) => {
                                    setCompany({ ...company, companyType: value });
                                }}
                            >
                                <SelectTrigger
                                    id="companyType"
                                    style={{
                                        height: "45px",
                                        width: "100%",
                                        padding: "16px 28px",
                                        fontSize: "16px",
                                        borderRadius: "10px",
                                        backgroundColor: "transparent",
                                    }}
                                >
                                    <SelectValue placeholder={company.companyType} />
                                </SelectTrigger>
                                <SelectContent>
                                    {businessTypes.map((type) => (
                                        <SelectItem key={type} value={type} className="text-[16px]">
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-[8px] w-full">
                            <Label htmlFor="phone" className="text-[16px]">
                                Phone Number<span className="text-red-500 text-[16px]">*</span>
                            </Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="text"
                                required
                                className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                                value={user.phoneNumber ?? ""}
                                onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-[8px] w-full">
                            <Label htmlFor="email" className="text-[16px]">
                                Email<span className="text-red-500 text-[16px]">*</span>
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="text"
                                required
                                className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                                value={user.email ?? ""}
                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-[8px] w-full">
                            <Label htmlFor="businessOwnerFullName" className="text-[16px]">
                                Secondary Email<span className="text-red-500 text-[16px]">*</span>
                            </Label>
                            <Input
                                id="alternateEmail"
                                name="alternateEmail"
                                type="text"
                                required
                                className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                                value={company.alternateEmail ?? ""}
                                onChange={(e) => setCompany({ ...company, alternateEmail: e.target.value })}
                            />
                        </div>
                    </div>
                    {error || saveError ? (
                        <p className="text-red-400 text-[14px] self-center">{error || saveError}</p>
                    ) : (
                        ""
                    )}
                    <Button
                        className="relative bottom-0 right-0 text-[14px] bg-pink text-fuchsia self-end justify-self-end w-fit h-fit flex justify-center items-center gap-[8px] hover:text-[white] hover:bg-fuchsia"
                        onClick={handleCollapse}
                        style={{ paddingInline: "25px" }}
                    >
                        Save and close <IoCheckmark className="text-[24px] mb-[2px]" />
                    </Button>
                </div>
            ) : (
                <div>
                    {initialPending ? (
                        <Spinner />
                    ) : (
                        <div className="flex gap-[20px] justify-between">
                            <div className="flex flex-col gap-[4px] overflow-hidden truncate text-ellipsis">
                                <p className="font-bold text-[16px]">Business Name</p>
                                <p>{company.name}</p>
                            </div>
                            <div className="flex flex-col gap-[4px]">
                                <p className="font-bold text-[16px]">Business Type</p>
                                <p>{company.companyType}</p>
                            </div>
                            <div className="flex flex-col gap-[4px] overflow-hidden truncate text-ellipsis">
                                <p className="font-bold text-[16px]">Phone Number</p>
                                <p>{user.phoneNumber}</p>
                            </div>
                            <div className="flex flex-col gap-[4px] overflow-hidden truncate text-ellipsis">
                                <p className="font-bold text-[16px]">Email</p>
                                <p>{user.email}</p>
                            </div>
                            <div className="flex flex-col gap-[4px] overflow-hidden truncate text-ellipsis">
                                <p className="font-bold text-[16px]">Secondary Email</p>
                                <p>{company.alternateEmail}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
