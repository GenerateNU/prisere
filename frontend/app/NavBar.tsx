import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserIcon } from "lucide-react";
import { logoutUser } from "@/actions/auth";
import { LuLayoutDashboard } from "react-icons/lu";
import { IoIosNotificationsOutline } from "react-icons/io";
import { HiOutlineTableCells } from "react-icons/hi2";
import { RiFilePaperLine } from "react-icons/ri";
import { IoPersonOutline, IoSettingsOutline } from "react-icons/io5";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";

export default function NavBar() {
    const pathname = usePathname();
    const queryClient = useQueryClient();

    const logout = async () => {
        queryClient.clear();
        await logoutUser();
    };

    const navigationItems = [
        { name: "Dashboard", href: "/", icon: <LuLayoutDashboard /> },
        { name: "Notifications", href: "/notifications", icon: <IoIosNotificationsOutline /> },
        { name: "Expense Tracker", href: "/expense-tracker", icon: <HiOutlineTableCells /> },
        { name: "Reports", href: "/claims", icon: <RiFilePaperLine /> },
        { name: "Business Profile", href: "/business-profile", icon: <IoPersonOutline /> },
    ];

    return (
        <nav className="flex flex-col w-[300px] p-10 bg-white h-screen fixed">
            <div className="relative mb-[50px] ">
                <Image src="/logo.png" width={140} height={50} style={{ objectFit: "fill" }} alt="logo" />
            </div>
            <ul className="flex flex-col flex-1">
                <div className="flex flex-col gap-5">
                    {navigationItems.map((item) => (
                        <li className="flex flex-col gap-5" key={item.name}>
                            <Link href={item.href} className={`rounded-lg`}>
                                <div
                                    className={`flex text-lg m-1 items-center hover:bg-muted rounded-lg px-3 py-2 gap-3 ${pathname === item.href && "text-fuchsia"}`}
                                >
                                    {item.icon}
                                    {item.name}
                                </div>
                            </Link>
                            {item.name == "Notifications" && <hr className="border-grey" />}
                        </li>
                    ))}
                </div>
            </ul>
            <div className="flex flex-col gap-5">
                <Link href="/profile">
                    <div className={`flex gap-3 items-center text-lg ${pathname === "/profile" && "text-fuchsia"}`}>
                        <IoSettingsOutline size={"24px"} />
                        Settings
                    </div>
                </Link>
                <Link
                    href={"/"}
                    onClick={async () => {
                        await logout();
                    }}
                    className="h-[40px] flex items-center justify-start gap-3"
                >
                    <UserIcon size={"24px"} />
                    <p className="text-lg">Logout</p>
                </Link>
            </div>
        </nav>
    );
}
