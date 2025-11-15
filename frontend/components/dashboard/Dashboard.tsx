"use client";
import { ReactNode, useState } from "react";
import { Button } from "../ui/button";
import { VscBellDot } from "react-icons/vsc";
import NotificationPage from "@/app/notifications/noification-page";
import { useRouter } from "next/navigation";

interface DashboardWrapperProps {
    children: ReactNode;
}
export default function DashboardWrapper({ children }: DashboardWrapperProps) {
    const [showNotifs, setShowNotifs] = useState<boolean>(false);
    const router = useRouter();
    const onClick = () => {
        setShowNotifs(false);
        router.push("/");
    };
    return (
        <div>
            {showNotifs ? (
                <NotificationPage backArrow={true} onClick={onClick} />
            ) : (
                <div className="bg-[#f5f5f5] flex flex-col gap-8 px-16 pt-16 pb-8 mx-auto">
                    <div className="flex justify-between items-center">
                        <h2 className="text-4xl font-bold">Dashboard</h2>
                        <div className="rounded-full bg-white w-10 h-10 flex items-center justify-center">
                            <Button size={"icon"} value={"secondary"} onClick={() => setShowNotifs(true)}>
                                <VscBellDot />
                            </Button>
                        </div>
                    </div>
                    {children}
                </div>
            )}
        </div>
    );
}
