"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Overview from "./overview/Overview";
import ViewDocuments from "./view-documents/ViewDocuments";

export default function BusinessProfile() {
    const tabs = [
        {
            name: "Overview",
            value: "overview",
            content: <Overview />,
        },
        {
            name: "View Documents",
            value: "documents",
            content: <ViewDocuments />,
        },
    ];

    return (
        <div className="p-[50px] flex flex-col gap-[23px] bg-[var(--slate)] min-h-screen">
            <div className="pb-[10px]">
                <h2 className="text-[30px] font-bold">My Business Profile</h2>
            </div>
            <Tabs defaultValue="overview" className="gap-[23px]">
                <TabsList className=" bg-[var(--slate)] rounded-none p-0">
                    {tabs.map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className=" bg-[var(--slate)] p-[10px] text-[16px] data-[state=active]:bg-[var(--slate)] data-[state=active]:border-[var(--fuchsia)] data-[state=active]:text-[var(--fuchsia)] hover:text-[var(--fuchsia)] h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none"
                        >
                            {tab.name}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {tabs.map((tab) => (
                    <TabsContent key={tab.value} value={tab.value}>
                        {tab.content}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
