"use client";
import { ReactNode } from "react";

interface DashboardWrapperProps {
    children: ReactNode;
}
export default function DashboardWrapper({ children }: DashboardWrapperProps) {
    return (
        <div>
            <div className="bg-slate flex flex-col gap-8 px-16 pt-16 pb-8 mx-aut min-h-screen">
                <div className="flex justify-between items-center">
                    <h2 className="text-4xl font-bold">Dashboard</h2>
                </div>
                {children}
            </div>
        </div>
    );
}
