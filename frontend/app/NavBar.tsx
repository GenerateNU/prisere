"use client";

import { usePathname, useRouter } from "next/navigation";
import NavBarCircle from "../icons/NavBarCircle";
import Link from "next/link";
import Chevron from "@/icons/Chevron";
import { UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/actions/auth";

export default function NavBar() {
    const pathname = usePathname();
    const nextRouter = useRouter();

    const logout = async () => {
        await logoutUser();
    };

    const navigationItems = [
        { name: "Dashboard", href: "/", icon: "" },
        { name: "Notifications", href: "/notifications", icon: "" },
        { name: "Business Profile", href: "/business-profile", icon: "" },
        { name: "Claims", href: "/claims", icon: "" },
        { name: "Expense Tracker", href: "/expense-tracker", icon: "" },
    ];

    return (
        <nav className="w-[300px] bg-[#d9d9d9] justify-center px-[27px] min-h-screen fixed">
            <ul className="flex flex-col justify-between h-screen pt-[152px] pb-[54px]">
                <div className="space-y-[30px]">
                    {navigationItems.map((item) => (
                        <li key={item.name}>
                            <Link href={item.href}>
                                <div
                                    className={`flex px-[20px] py-[15px] text-[20px] justify-between items-center ${pathname === item.href && "bg-[#6e6e6e] rounded-[53px] text-white font-bold"}`}
                                >
                                    <div className="flex gap-[25px] items-center">
                                        <NavBarCircle /> {/* Placeholder for icons */}
                                        {item.name}
                                    </div>
                                    {pathname === item.href && <Chevron />}
                                </div>
                            </Link>
                        </li>
                    ))}
                </div>
                <li>
                    <div>
                        <Link href="/profile">
                            <div className="flex nav-bar-item gap-[25px] text-[20px] px-[20px] py-[15px] items-center">
                                <NavBarCircle /> {/* Placeholder for icons */}
                                Prisere
                            </div>
                        </Link>
                        <Button
                            onClick={async () => {
                                await logout();
                                nextRouter.push("/");
                            }}
                            className="h-[40px] flex justify-start gap-[25px] px-[20px] py-[15px]"
                            variant="outline"
                        >
                            <UserIcon />
                            <p>Logout</p>
                        </Button>
                    </div>
                </li>
            </ul>
        </nav>
    );
}
