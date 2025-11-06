"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LuLayoutDashboard } from "react-icons/lu";
import { IoIosNotificationsOutline } from "react-icons/io";
import { HiOutlineTableCells } from "react-icons/hi2";
import { RiFilePaperLine } from "react-icons/ri";
import { IoPersonOutline, IoSettingsOutline } from "react-icons/io5";
import Image from "next/image";

export default function NavBar() {
    const pathname = usePathname();

    const navigationItems = [
        { name: "Dashboard", href: "/", icon: <LuLayoutDashboard/>},
        { name: "Notifications", href: "/notifications", icon: <IoIosNotificationsOutline/> },
        { name: "Expense Tracker", href: "/expense-tracker", icon: <HiOutlineTableCells/> },
        { name: "Claims", href: "/claims", icon: <RiFilePaperLine/> },
        { name: "Business Profile", href: "/business-profile", icon: <IoPersonOutline/> },
    ];

    return (
        <nav className="flex flex-col w-[300px] p-10 bg-white h-screen fixed">
             <div className="relative mb-[50px] ">
                <Image src="/logo.png" width={140} height={50} style={{ objectFit: 'fill' }} alt="logo"/>
            </div>
            <ul className="flex flex-col flex-1">
                <div className="flex flex-col gap-5">
                    {navigationItems.map((item) => (
                        <li className="flex flex-col gap-5" key={item.name}>
                            <Link href={item.href} className={`rounded-lg ${pathname === item.href && "bg-[#F7DCE5]"}`}>
                                <div
                                    className={`flex text-lg m-1 items-center gap-3 ${pathname === item.href && "text-fuchsia"}`}
                                >
                                    {item.icon}
                                    {item.name}
                                </div>
                            </Link>
                            {item.name == "Notifications" && <hr className="border-charcoal"/>}
                        </li>
                    ))}
                </div>
            </ul>
            <div className="mt-auto">
                <Link href="/profile">
                    <div className={`flex gap-3 items-center text-lg ${pathname === "/profile" && "text-fuchsia"}`}>
                        <IoSettingsOutline/>
                        Settings
                    </div>
                </Link>
            </div>
        </nav>
    );
}
