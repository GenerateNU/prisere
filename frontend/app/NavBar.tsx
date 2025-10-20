"use client";

import { usePathname } from "next/navigation";
import NavBarCircle from "../icons/NavBarCircle";
import Link from "next/link";
import Chevron from "@/icons/Chevron";

export default function NavBar() {
    const pathname = usePathname();

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
                    <Link href="/profile">
                        <div className="flex nav-bar-item gap-[25px] text-[20px] px-[20px] py-[15px] items-center">
                            <NavBarCircle /> {/* Placeholder for icons */}
                            Prisere
                        </div>
                    </Link>
                </li>
            </ul>
        </nav>
    );
}
